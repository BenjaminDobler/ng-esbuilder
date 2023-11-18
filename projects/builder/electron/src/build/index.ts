import { createBuilder, BuilderContext, BuilderOutput, targetFromTargetString } from '@angular-devkit/architect';
import { Schema } from './schema';
import { ElectronRunner } from '../util/electron.runner';
import { copyFileSync } from 'fs';
import { Observable, combineLatest, from, map, switchMap, tap } from 'rxjs';
import { getLiveCodePlugin } from '../util/reload.plugin';
import { ensureDirSync } from 'fs-extra';
import { externalizePlugin } from '../util/externalize.plugin';

function customBuilderFunc(options: Schema, context: BuilderContext): Observable<BuilderOutput> {
  const initialize = async () => {
    const rendererTargets = options.rendererTargets;
    const runs = rendererTargets.map((target) => {
      const rendererTarget = targetFromTargetString('frontend:build:production');
      const outputPath = options.outputPath + '/renderer/' + rendererTarget.project;
      return context.scheduleTarget(targetFromTargetString(target.target), {
        outputPath,
        watch: true,
        plugins: [externalizePlugin as any]
      });
    });

    const rendererRuns = await Promise.all(runs);

    const mainTarget = targetFromTargetString(options.mainTarget);
    const mainOptions = await context.getTargetOptions(mainTarget);
    const mainRun = await context.scheduleTarget(targetFromTargetString(options.mainTarget), { outputPath: options.outputPath, watch: true, plugins: [getLiveCodePlugin(mainOptions, context)] as any });
    return { rendererRuns, mainRun };
  };

  ensureDirSync(context.workspaceRoot + '/' + options.outputPath);
  copyFileSync(context.workspaceRoot + '/' + options.packageJson, context.workspaceRoot + '/' + options.outputPath + '/package.json');

  const runner = new ElectronRunner(options.outputPath);

  return from(initialize()).pipe(
    switchMap(({ rendererRuns, mainRun }) => {

      const rendererOutputs = rendererRuns.map((r) => r.output.pipe(tap(()=>{
        console.log('======== renderer output');
        runner.reloadWindows();
      })));

      const mainOutput = mainRun.output.pipe(tap(()=>{
        console.log('======== main output');
        runner.reloadMain();
      }));

      return combineLatest([...rendererOutputs, mainOutput]).pipe(
        map((outputs) => {
          return {
            success: outputs.every((o) => o.success),
          };
        })
      );
    })
  );
}

export default createBuilder(customBuilderFunc);
