import * as esbuild from 'esbuild';

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
import { copyAssets } from '@angular-devkit/build-angular/src/utils/copy-assets';
import { Schema } from './schema';
import { resolve } from 'path';
import { externalizePlugin } from '../utils/externalize.plugin';
import { linkToNodeModules } from '../utils/link';

async function customBuilderFunc(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  console.log('running esbuild', options.plugins);

  let plugins: esbuild.Plugin[] = [externalizePlugin];
  if (options.plugins) {
    plugins = [...plugins, ...options.plugins];
  }
  console.log('options plugins', options.plugins);
  const entryPoints = options.entryPoints.map((entryPoint) => resolve(context.workspaceRoot, entryPoint));

  const result = await esbuild.build({
    entryPoints,
    platform: options.platform,
    bundle: options.bundle,
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

  if (options.linkToNodeModules) {
    try {
      linkToNodeModules(resolve(context.workspaceRoot, options.outputPath), `./node_modules/${options.libName}`);
    } catch (e) {
      console.log(e);
    }
  }

  return { success: true };
}

export default createBuilder(customBuilderFunc);
