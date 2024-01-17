import { apply, chain, mergeWith, move, MergeStrategy, Rule, SchematicContext, SchematicsException, template, Tree, url, strings } from '@angular-devkit/schematics';
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
    return chain([addProject(options, appDir, folderName), mergeWith(apply(url('./files/'), [move(appDir),]), MergeStrategy.Overwrite)]);
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
        builder: '@richapps/builder.node:build',
        options: {
          externals: ['electron'],
          assets: [],
          outputPath: `dist/${folderName}`,
          entryPoints: [`${sourceRoot}/main.ts`],
        },
      },
      serve: {
        builder: '@richapps/builder.node:serve',
        options: {
          outputPath: 'dist/main',
          main: 'projects/main/src/index.ts',
        },
      },
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
