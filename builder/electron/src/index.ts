import { createBuilder, BuilderContext, BuilderOutput, targetFromTargetString } from '@angular-devkit/architect';
import { Schema } from './schema';
import { ElectronRunner } from './util/electron.runner';
import { copyFileSync } from 'fs';
import { combineLatest } from 'rxjs';
import { getLiveCodePlugin } from './util/reload.plugin';



const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

// Our func. that is executed by the tasked based system
async function customBuilderFunc(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  const rendererTargets = options.rendererTargets;

  const runs = rendererTargets.map((target) => {
    const rendererTarget = targetFromTargetString('frontend:build:production');
    const outputPath = options.outputPath + '/renderer/' + rendererTarget.project;
    return context.scheduleTarget(targetFromTargetString(target.target), {
      outputPath,
    });
  });

  const rendererRuns = await Promise.all(runs);

  const mainTarget = targetFromTargetString(options.mainTarget);
  const mainOptions = await context.getTargetOptions(mainTarget);
  console.log('main target ', mainTarget);
  console.log('main options ', mainOptions);
  const mainRun = await context.scheduleTarget(targetFromTargetString(options.mainTarget), { outputPath: options.outputPath, plugins: [getLiveCodePlugin(mainOptions, context)] as any });

  combineLatest([...rendererRuns.map((r) => r.progress), mainRun.progress]).subscribe((results) => {
    console.log('results ', results);
  });

  combineLatest([...rendererRuns.map((r) => r.output), mainRun.output]).subscribe((results) => {
    console.log('outputs ', results);
  });

  

  copyFileSync(context.workspaceRoot + '/' + options.packageJson, context.workspaceRoot + '/' + options.outputPath + '/package.json');
  const runner = new ElectronRunner();
  runner.runElectron(options.outputPath);

  setInterval(() => { 
    runner.send('ping');
  }, 1000);

  await wait(3000000);
  return { success: true };
}

export default createBuilder(customBuilderFunc);
