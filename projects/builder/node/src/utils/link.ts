import { ensureDirSync, existsSync, symlinkSync } from 'fs-extra';
import { dirname, resolve } from 'path';

export function linkToNodeModules(fromPath, toPath) {
  const parentToDir = dirname(toPath);
  ensureDirSync(parentToDir);
  const doesExist = existsSync(toPath);
  if (existsSync(resolve(fromPath)) && !doesExist) {
    try {
      symlinkSync(resolve(fromPath), resolve(toPath), 'junction');
    } catch (e) {
      console.log(e);
    }
  }
}
