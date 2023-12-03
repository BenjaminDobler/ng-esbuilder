import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { buildApplication, ApplicationBuilderOptions } from '@angular-devkit/build-angular';
import { Plugin } from 'esbuild';
import { getExternalizePlugin } from '../utils/externalize.plugin';

export interface CustomOptions {
  plugins?: Plugin[];
}
export type CustomBuilderOptions = ApplicationBuilderOptions & CustomOptions;

/**
 * Creates a builder function with the given options and context.
 * @param options - The custom builder options.
 * @param context - The builder context.
 * @returns The result of building the application.
 */
export function createBuilderFunc(options: CustomBuilderOptions, context: BuilderContext) {
  let plugins: Plugin[] = [];
  if (options.plugins) {
    plugins = [...plugins, ...options.plugins, getExternalizePlugin(options.externalDependencies, true)];
  }
  return buildApplication(options, context, plugins);
}

export default createBuilder(createBuilderFunc);
