import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { executeDevServerBuilder, DevServerBuilderOptions } from '@angular-devkit/build-angular';

export interface CustomEsbuildPlugins {}

export function createBuilderFunc(options: DevServerBuilderOptions, context: BuilderContext) {
  options.forceEsbuild = true;
  options.watch = true;
  return executeDevServerBuilder(options, context, undefined);
}

export default createBuilder(createBuilderFunc);
