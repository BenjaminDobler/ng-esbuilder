import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  buildApplication,
  ApplicationBuilderOptions,
} from '@angular-devkit/build-angular';
import { PluginBuild } from 'esbuild';

export interface CustomEsbuildPlugins {}

export type CustomWebpackBrowserSchema = BrowserBuilderOptions &
  CustomEsbuildPlugins;

export function createBuilderFunc(
  options: ApplicationBuilderOptions,
  context: BuilderContext
) {
  const customEsbuildPlugins = [
    {
      name: 'my-esbuild-plugin',
      setup: (build: PluginBuild) => {
        // build.initialOptions.external = ['fs', 'path', 'electron'];
        // build.initialOptions.external = ['fs', 'path', 'electron'];
        // console.log('do esbuild plugin stuff');
        // console.log(build);
        build.onResolve({ filter: /.*/ }, (args) => {
          // console.log('args ', args);
          // let moduleName = args.path.split('/')[0];
          // console.log('module name ', moduleName);
          // console.log('on resolve ', args.path);
          if (!args.path.startsWith('.')) {
            console.log('package ', args.path);
          }
          
          if (args.path === 'fs') {
            console.log('externalize fs');
            return { external: true };
          }
          if (args.path === 'electron') {
            return { path: 'electron', external: true };
          }
          if (args.path === 'path') {
            return { path: 'path', external: true };
          }

          /*
          if (nodeModules.includes(moduleName)) {
            return { path: args.path, external: true };
          }
          */
        });
      },
    },
  ];
  return buildApplication(options, context, customEsbuildPlugins);
}

export default createBuilder(createBuilderFunc);
