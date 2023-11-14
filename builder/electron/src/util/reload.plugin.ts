import { readFileSync } from 'fs';
import { Plugin } from 'esbuild';
import { BuilderContext } from '@angular-devkit/architect';

const codeTemplate = (identifier: string) => {
  return `
process.on('message', (message) => {
    console.log('reload event received');
    console.log(message);
    // TODO: add code to reload the app windows
  });
`;
};

/**
 * Returns a esbuild plugin code that will inject code into the main file to listen for reload events via ipc process communication
 * @param options 
 * @param context 
 * @returns 
 */
export function getLiveCodePlugin(options, context: BuilderContext) {
  const ipcIdentifier = '@richapps/builder.electron:ipc';
  const injectLiveCodePlugin: Plugin = {
    name: '@richapps/builder.electron:inject-live-code',
    setup: (build: any) => {
      build.onLoad({ filter: /.*/ }, (args: any) => {
        if (args.path == context.workspaceRoot + '/' + options.main) {
          const fileContents = readFileSync(context.workspaceRoot + '/' + options.main, { encoding: 'utf-8' });
          let newContent = codeTemplate(ipcIdentifier);
          newContent += fileContents;
          return {
            pluginData: args.pluginData,
            contents: newContent,
            loader: 'ts',
          };
        }
      });
    },
  };

  return injectLiveCodePlugin;
}
