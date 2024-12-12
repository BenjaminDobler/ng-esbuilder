import * as esbuild from 'esbuild';
import { json, tags } from '@angular-devkit/core';

import { createBuilder, BuilderContext, BuilderOutput, targetFromTargetString } from '@angular-devkit/architect';

import { Schema } from './schema';
import { basename, resolve } from 'path';

import type { Plugin } from 'esbuild';
import * as cp from 'child_process';

import { Schema as NodeBuildOptions } from '../build/schema';

async function executeESServer(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  console.log('running esbuild');


  const buildTarget = targetFromTargetString(options.buildTarget);

  
  // Get the browser configuration from the target name.
  const rawOptions = (await context.getTargetOptions(
    buildTarget,
  )) as json.JsonObject & NodeBuildOptions;

  const entryPointSource = rawOptions.entryPoints[0];
  const entryPointFilename = basename(entryPointSource, 'ts') + 'js';
  const fileToRun = resolve(context.workspaceRoot, rawOptions.outputPath, entryPointFilename);


  console.log(fileToRun);

  console.log('rawOptions', rawOptions);


  let child;

  const rerunProcess = () => {
    console.log('rerun process');
    child && child.kill();
    child = cp.spawn('node', [fileToRun], {
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
    entryPoints: [resolve(context.workspaceRoot, entryPointSource)],
    minify: false,
    outdir: resolve(context.workspaceRoot, rawOptions.outputPath),
    bundle: true,
    logLevel: 'debug',
    plugins,
  });
  await ctx.watch();
  return { success: true };
}

export default createBuilder(executeESServer);
