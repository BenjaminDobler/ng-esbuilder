import { readFileSync } from 'fs';
import { Plugin } from 'esbuild';
import { BuilderContext } from '@angular-devkit/architect';

const codeTemplate = (identifier: string) => {
  return `
const electron = require('electron');
process.on('message', (message) => {
  console.log('message from child ', message);
    if (message == '${identifier}:reload') {
      console.log('reload windows');
      for (const window of electron.BrowserWindow.getAllWindows()) { 
        let u = new URL(window.webContents.getURL());
        if (u.pathname.includes('.html')) {
          window.webContents.reloadIgnoringCache();
        } else {
          if (u.protocol == 'file:') {
            window.loadURL('file://' + u.pathname + 'index.html' + u.hash);
          } else {
            const reloadURL = u.origin + '/index.html' + u.hash;
            window.loadURL(reloadURL);
          }
        }
      };
    }
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
        if (args.path == context.workspaceRoot + '/' + options.entryPoints[0]) {
          const fileContents = readFileSync(context.workspaceRoot + '/' + options.entryPoints[0], { encoding: 'utf-8' });
          let newContent = fileContents;
          newContent += codeTemplate(ipcIdentifier);
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
