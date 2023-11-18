import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { executeDevServerBuilder, DevServerBuilderOptions } from '@angular-devkit/build-angular';
import { from, switchMap } from 'rxjs';

export interface CustomEsbuildPlugins {}

export function createBuilderFunc(options: DevServerBuilderOptions, context: BuilderContext) {
  

  // const setup = async () => {
  //   console.log(options);
  //   const buildTarget = targetFromTargetString(options.buildTarget || '');
  //   const buildOptions = await context.getTargetOptions(buildTarget);
  //   return buildOptions;
  // };

  // return from(setup()).pipe(
  //   switchMap((buildOptions) => {
  //     console.log(buildOptions);
  //     return executeDevServerBuilder(options, context, undefined);
  //   })
  // );

  console.log(options);
  options.forceEsbuild = true;
  options.watch = true;

  return executeDevServerBuilder(options, context, undefined);


}

export default createBuilder(createBuilderFunc);
