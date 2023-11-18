import * as esbuild from 'esbuild';

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';

import { Schema } from './schema';
import { resolve } from 'path';

import type { Plugin } from 'esbuild';
import * as cp from 'child_process';

async function executeESServer(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  console.log('running esbuild');

  let child;

  const rerunProcess = () => {
    console.log('rerun process');
    child && child.kill();
    child = cp.spawn('node', [resolve(context.workspaceRoot, options.main)], {
      stdio: 'inherit',
    });
  };

  const plugins: Plugin[] = [
    {
      name: 'liveReload',
      setup(build) {
        build.onStart(() => {
          console.error('------- onStart'); // TODO: why is the log not shown
        });
        build.onEnd((result) => {
          console.log('------- onEnd'); // TODO: why is the log not shown
          rerunProcess();
        });
      },
    },
  ];

  let ctx = await esbuild.context({
    entryPoints: [resolve(context.workspaceRoot, options.main)],
    minify: false,
    outdir: resolve(context.workspaceRoot, options.outputPath),
    bundle: true,
    logLevel: 'debug',
    plugins,
  });
  await ctx.watch();
  return { success: true };
}

export default createBuilder(executeESServer);
