import { createBuilder, BuilderContext, BuilderOutput, targetFromTargetString } from '@angular-devkit/architect';
import { Schema } from './schema';
import { ElectronRunner } from '../util/electron.runner';
import { copyFileSync } from 'fs';
import { MonoTypeOperatorFunction, Observable, combineLatest, from, map, scan, skip, switchMap, tap } from 'rxjs';
import { getLiveCodePlugin } from '../util/reload.plugin';
import { ensureDirSync } from 'fs-extra';
import { getBuiltInNodeModules, getExternalizePlugin } from '../util/externalize.plugin';

export function tapCount<T>(callback: (index: number) => void): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      scan<T, [T, number]>(([, index], t) => [t, index + 1], [undefined!, -1]),
      tap(([t, index]) => {
        callback(index);
      }),
      map(([t, index]) => (console.log(`[${index}]: ${t}`), t))
    );
}

function customBuilderFunc(options: Schema, context: BuilderContext): Observable<BuilderOutput> {
  const initialize = async () => {
    const rendererTargets = options.rendererTargets;

    const rendererTargetOptions = await Promise.all(rendererTargets.map((target) => context.getTargetOptions(targetFromTargetString(target.target))));
    
    const runs = rendererTargets.map((target, i) => {
      console.log('remder target');
      console.log(target);
      const rendererTarget = targetFromTargetString(target.target); // TODO: get target string from options
      const rendererOptions = rendererTargetOptions[i];
      let externalDependencies = rendererOptions.externalDependencies as string[] || [];
      const nodeModuleDependencies = ['_http_agent', '_http_client', '_http_common', '_http_incoming', '_http_outgoing', '_http_server', '_stream_duplex', '_stream_passthrough', '_stream_readable', '_stream_transform', '_stream_wrap', '_stream_writable', '_tls_common', '_tls_wrap', 'assert', 'assert/strict', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'dns/promises', 'domain', 'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'readline/promises', 'repl', 'stream', 'stream/consumers', 'stream/promises', 'stream/web', 'string_decoder', 'sys', 'timers', 'timers/promises', 'tls', 'trace_events', 'tty', 'url', 'util', 'util/types', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'];
      externalDependencies = [...externalDependencies, ...nodeModuleDependencies];
      const outputPath = options.outputPath + '/renderer/' + rendererTarget.project;
      return context.scheduleTarget(targetFromTargetString(target.target), {
        outputPath,
        watch: options.watch,
        externalDependencies,
      });
    });

    const rendererRuns = await Promise.all(runs);

    const mainTarget = targetFromTargetString(options.mainTarget);
    const mainOptions = await context.getTargetOptions(mainTarget);
    const mainRun = await context.scheduleTarget(targetFromTargetString(options.mainTarget), { outputPath: options.outputPath, watch: options.watch, plugins: [getLiveCodePlugin(mainOptions, context)] as any });
    return { rendererRuns, mainRun };
  };

  ensureDirSync(context.workspaceRoot + '/' + options.outputPath);
  copyFileSync(context.workspaceRoot + '/' + options.packageJson, context.workspaceRoot + '/' + options.outputPath + '/package.json');

  const runner = new ElectronRunner(options.outputPath);

  return from(initialize()).pipe(
    switchMap(({ rendererRuns, mainRun }) => {
      const rendererOutputs = rendererRuns.map((r) => r.output.pipe(tapCount((index) => (options.watch && index > 0 ? runner.reloadWindows() : null))));

      const mainOutput = mainRun.output.pipe(tapCount((index) => (options.watch && index > 0 ? runner.reloadMain() : null)));

      return combineLatest([...rendererOutputs, mainOutput]).pipe(
        tapCount((index: number) => {
          if (index === 0) {
            if (options.watch) {
              runner.reloadMain();
            }
          }
        }),
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
