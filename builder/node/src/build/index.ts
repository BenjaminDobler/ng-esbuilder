import * as esbuild from 'esbuild';

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';

import { Schema } from './schema';
import { resolve } from 'path';

async function customBuilderFunc(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  console.log('running esbuild', options.plugins);

  const customEsbuildPlugins = [
    {
      name: 'my-esbuild-plugin',
      setup: (build: any) => {
        // build.initialOptions.external = ['fs', 'path', 'electron'];
        console.log('do esbuild plugin stuff');
        console.log(build);



        // build.onLoad({ filter: /.*/ }, (args: any) => {
        //   console.log('args ', args);
        //   console.log(context.workspaceRoot + '/' + options.main);

        //   if (args.path == context.workspaceRoot + '/' + options.main) {
        //     console.log('yes it is the same!!!');
        //   }
        //   // READ THE FILE args.path
        //   return {
        //     pluginData: args.pluginData,
        //     contents: "console.log('hallo')",
        //     loader: 'ts',
        //   };
        // });
        build.onResolve({ filter: /.*/ }, (args: any) => {
          // console.log('args ', args);
          // let moduleName = args.path.split('/')[0];
          // console.log('module name ', moduleName);
          if (!args.path.startsWith('.')) {
            console.log('package ', args.path);
          }

          if (args.path === 'fs') {
            return { path: 'fs', external: true };
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

  let plugins = customEsbuildPlugins;
  if (options.plugins) {
    plugins = [...customEsbuildPlugins, ...options.plugins];
  }
  const result = await esbuild.build({
    entryPoints: [resolve(context.workspaceRoot, options.main)],
    bundle: true,
    outdir: resolve(context.workspaceRoot, options.outputPath),
    plugins,
  });
  console.log(result);
  return { success: true };
}

export default createBuilder(customBuilderFunc);
