import { PluginBuild } from 'esbuild';


// returns a list of all build in node modules
// function getBuiltInNodeModules() {
//   const builtInModules = require('module').builtinModules;
//   return builtInModules;
// }


export const externalizePlugin = {
  name: 'my-esbuild-plugin',
  setup: (build: PluginBuild) => {
    // build.initialOptions.external = ['fs', 'path', 'electron'];
    // build.initialOptions.external = ['fs', 'path', 'electron'];
    // console.log('do esbuild plugin stuff');
    // console.log(build);
    // let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    // build.onResolve({ filter }, args => ({ path: args.path, external: true }))
  
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
};
