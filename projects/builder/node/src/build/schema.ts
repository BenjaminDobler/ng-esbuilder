import { Plugin } from 'esbuild';

export interface Schema {
  entryPoints: string[];
  outputPath: string;
  platform: 'browser' | 'node';
  bundle: boolean;
  plugins?: Plugin[];
  /**
   * List of static application assets.
   */
  assets?: AssetPattern[];

  libName: string;
  linkToNodeModules: boolean;
}

export type AssetPattern = AssetPatternClass | string;
export interface AssetPatternClass {
  /**
   * Allow glob patterns to follow symlink directories. This allows subdirectories of the
   * symlink to be searched.
   */
  followSymlinks?: boolean;
  /**
   * The pattern to match.
   */
  glob: string;
  /**
   * An array of globs to ignore.
   */
  ignore?: string[];
  /**
   * The input directory path in which to apply 'glob'. Defaults to the project root.
   */
  input: string;
  /**
   * Absolute path within the output.
   */
  output: string;
}
