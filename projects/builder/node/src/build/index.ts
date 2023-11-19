import * as esbuild from 'esbuild';

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
import { copyAssets } from '@angular-devkit/build-angular/src/utils/copy-assets';
import { Schema } from './schema';
import { resolve } from 'path';
import { getExternalizePlugin } from '../utils/externalize.plugin';
import { linkToNodeModules } from '../utils/link';
import { Observable, Subject, from, map, switchMap } from 'rxjs';

function customBuilderFunc(options: Schema, context: BuilderContext): Observable<BuilderOutput> {
  console.log('running esbuild', options.plugins);

  const init = async () => {
    const entryPoints = options.entryPoints.map((entryPoint) => resolve(context.workspaceRoot, entryPoint));
    const progress = new Subject<esbuild.BuildResult>();

    const progressPlugin: esbuild.Plugin = {
      name: '@richapps/builder.node:progress-plugin',
      setup(build) {
        build.onStart(() => {
          console.log('------- onStart');
        });
        build.onEnd((result) => {
          console.log('------- onEnd');
          progress.next(result);
          if (!options.watch) {
            ctx.dispose();
          }
        });
      },
    };

    let plugins: esbuild.Plugin[] = [getExternalizePlugin(options.externals), progressPlugin];
    if (options.plugins) {
      plugins = [...plugins, ...options.plugins];
    }

    let ctx = await esbuild.context({
      entryPoints,
      minify: false,
      outdir: resolve(context.workspaceRoot, options.outputPath),
      bundle: true,
      platform: options.platform,
      logLevel: 'debug',
      plugins,
    });

    if (options.watch) {
      await ctx.watch();
    } else {
      console.log('rebuild');
      ctx.rebuild();
    }

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
    return progress;
  };

  return from(init()).pipe(
    switchMap((progress) => progress),
    map((result) => {
      return {
        success: true,
      };
    })
  );
}

export default createBuilder(customBuilderFunc);
