import { createBuilder, BuilderContext, BuilderOutput, targetFromTargetString } from '@angular-devkit/architect';
import { Schema } from './schema';
import { build } from 'electron-builder';

async function electronPackageBuilder(options: Schema, context: BuilderContext): Promise<BuilderOutput> {
  const run = await context.scheduleTarget(targetFromTargetString(options.buildTarget));
  const result = await run.result;
  process.env.ALLOW_ELECTRON_BUILDER_AS_PRODUCTION_DEPENDENCY = 'true';
  

  const buildResult = await build({ ...options.targets, config: options.config });
  console.log('buildResult', buildResult);
  return { success: true };
}

export default createBuilder(electronPackageBuilder);
