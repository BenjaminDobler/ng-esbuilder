import * as esbuild from 'esbuild';

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
import { copyAssets } from '@angular-devkit/build-angular/src/utils/copy-assets';
import { Schema } from './schema';
import { resolve } from 'path';
import { externalizePlugin } from '../utils/externalize.plugin';

async function customBuilderFunc(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  console.log('running esbuild', options.plugins);

  let plugins: esbuild.Plugin[] = [externalizePlugin];
  if (options.plugins) {
    plugins = [...plugins, ...options.plugins];
  }

  const entryPoints = options.entryPoints.map((entryPoint) => resolve(context.workspaceRoot, entryPoint));
  const result = await esbuild.build({
    entryPoints,
    bundle: true,
    platform: 'node',
    outdir: resolve(context.workspaceRoot, options.outputPath),
    plugins,
  });

  const projectName = context.target?.project;
  if (!projectName) {
    throw new Error('The builder requires a target.');
  }
  const projectMetatdata = await context.getProjectMetadata(projectName);

  if (options.assets) {
    const normalizedAssets = normalizeAssetPatterns(options.assets, context.workspaceRoot, projectMetatdata.root as string, projectMetatdata.sourceRoot as string);
    await copyAssets(normalizedAssets, [options.outputPath], context.workspaceRoot);
  }

  return { success: true };
}

export default createBuilder(customBuilderFunc);