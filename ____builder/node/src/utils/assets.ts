// private copyAsset(asset: AssetOption, file: string) {
//     const inFile = path.join(asset.input, file);
//     const outFile = path.join(asset.output, file);
//     copySync(inFile, outFile);
// }

import { AssetPattern } from '../build/schema';
import { join } from 'path';
import * as glob from 'glob';
import { copySync } from 'fs-extra';
import { BuilderContext } from '@angular-devkit/architect';

import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
import { copyAssets as copyAssets2 } from '@angular-devkit/build-angular/src/utils/copy-assets';

export async function copyAssets(assets: AssetPattern[], targetDir: string, context: BuilderContext) {
  const projectName = context.target?.project;
  if (!projectName) {
    throw new Error('The builder requires a target.');
  }
  const projectMetatdata = await context.getProjectMetadata(projectName);
  console.log(projectMetatdata);

  console.log('Normalized assets');
  const normalizedAssets = normalizeAssetPatterns(assets, context.workspaceRoot, projectMetatdata.root as string, projectMetatdata.sourceRoot as string);
  console.log(normalizedAssets);
  console.log('');

  await copyAssets2(normalizedAssets, [targetDir], context.workspaceRoot);

}
