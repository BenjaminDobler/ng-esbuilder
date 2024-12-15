import { apply, chain, mergeWith, move, MergeStrategy, Rule, SchematicContext, SchematicsException, template, Tree, url, strings, externalSchematic } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';

import { JsonObject } from '@angular-devkit/core';
import { join, normalize } from 'path';

export interface ApplicationOptions extends JsonObject {
  name: string;
  projectRoot: string;
  main: string;
}

export default function (options: ApplicationOptions): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const { appDir, appRootSelector, folderName, sourceDir } = await getAppOptions(host, options);


    const rendererRule = externalSchematic('@schematics/angular', 'application', {
      name: options.name + '.renderer',
      projectRoot: appDir + '/renderer'
    });

    const mainRule = externalSchematic('@richapps/builder.node', 'application', {
      name: options.name + '.main',
      projectRoot: appDir + '/main'
    });

    return chain([
      rendererRule,
      mainRule,
      addProject(options, appDir, folderName),
      mergeWith(apply(url('./files/'), [move(appDir)]), MergeStrategy.Overwrite)]);
  };
}

function addProject(options: ApplicationOptions, appDir: string, folderName: string): Rule {
  let projectRoot = appDir;
  if (projectRoot) {
    projectRoot += '/';
  }
  const sourceRoot = join(normalize(projectRoot), 'src');

  const project = {
    projectType: 'application',
    root: normalize(projectRoot),
    sourceRoot,
    architect: {
      build: {
        builder: "@richapps/builder.electron:build",
        options: {
          outputPath: "dist/my.electron.app",
          rendererTargets: [
            {
              target: `${options.name}.renderer:build`
            }
          ],
          "mainTarget": `${options.name}.main:build`,
          "packageJson": appDir + "/package.json"
        }
      },
      "package": {
        "builder": "@richapps/builder.electron:package",
        "options": {
          "buildTarget": "electron:build",
          "reinstallNodeModules": true,
          "targets": {
            "mac": [
              "zip:x64",
              "zip:arm64"
            ],
            "win": [
              "zip:x64"
            ],
            "linux": [
              "tar.gz:x64"
            ]
          },
          "config": {
            "mac": {
              "category": "public.app-category.developer-tools",
              "type": "development",
              "hardenedRuntime": true,
              "gatekeeperAssess": false
            },
            "artifactName": "${productName}-${os}-${arch}.${ext}",
            "appId": "@richapps/apps:electron",
            "productName": "My Electron App",
            "copyright": "@richapps",
            "npmRebuild": true,
            "asar": false,
            "directories": {
              "app": "dist/electron/",
              "buildResources": "projects/demo/my.electron.app/resources",
              "output": "dist/my.electron.app"
            },
            "files": [
              "**/*"
            ],
            "fileAssociations": [
              {
                "ext": [
                  "myext"
                ],
                "name": "Some file association",
                "role": "Editor"
              }
            ]
          }
        }
      },


      // build: {
      //   builder: '@richapps/builder.node:build',
      //   options: {
      //     externals: ['electron'],
      //     assets: [],
      //     outputPath: `dist/${folderName}`,
      //     entryPoints: [`${sourceRoot}/${options.main}`],
      //   },
      // },
      // serve: {
      //   builder: '@richapps/builder.node:serve',
      //   options: {
      //     buildTarget: `${options.name}:build`,
      //   },
      // },
    },
  };
  return updateWorkspace((workspace) => {
    workspace.projects.add({
      name: options.name,
      ...project,
    });
  });
}

async function getAppOptions(
  host: Tree,
  options: ApplicationOptions
): Promise<{
  appDir: string;
  appRootSelector: string;
  folderName: string;
  sourceDir: string;
}> {
  const appRootSelector = `${options.prefix}-root`;

  const workspace = await getWorkspace(host);
  const newProjectRoot = (workspace.extensions.newProjectRoot as string | undefined) || '';

  // If scoped project (i.e. "@foo/bar"), convert dir to "foo/bar".
  let folderName = options.name.startsWith('@') ? options.name.slice(1) : options.name;
  if (/[A-Z]/.test(folderName)) {
    folderName = strings.dasherize(folderName);
  }

  const appDir = options.projectRoot === undefined ? join(normalize(newProjectRoot), folderName) : normalize(options.projectRoot);

  const sourceDir = `${appDir}/src/app`;

  return {
    appDir,
    appRootSelector,
    folderName,
    sourceDir,
  };
}
