export const externalizePlugin = {
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

      if (args.path.startsWith('@angular')) {
        console.log('package ', args.path);
        return { path: args.path, external: true };
      }

      if (args.path === 'esbuild') {
        console.log('package ', args.path);
        return { path: args.path, external: true };
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
};
