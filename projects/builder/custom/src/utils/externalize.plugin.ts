import { Plugin, PluginBuild } from 'esbuild';

// returns a list of all build in node modules
function getBuiltInNodeModules() {
  const builtInModules = require('module').builtinModules;
  return builtInModules;
}

export function getExternalizePlugin(externals: string[] = [], externalizeBuildInNodeModules: boolean = false): Plugin {
  return {
    name: '@richapps:externalize-plugin',
    setup: (build: PluginBuild) => {
      const externalize = externals;
      if (externalizeBuildInNodeModules) {
        const nodeModules = getBuiltInNodeModules();
        externalize.push(...nodeModules);
      }
      let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
      build.onResolve({ filter }, (args) => {
        if (externalize.includes(args.path)) {
          console.log('externalize frontend ', args.path);
          console.log(args);
          return { external: true };
        }
        // TODO: this needs to be cofigurable in the builder options
        if(args.path.startsWith('@angular-devkit') || args.path.startsWith('@angular/cli')) {
          return { external: true };
        }
      });
    },
  };
}
