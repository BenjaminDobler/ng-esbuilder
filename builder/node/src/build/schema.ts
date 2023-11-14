import { Plugin } from "esbuild";

export interface Schema {
  main: string;
  outputPath: string;
  plugins?: Plugin[];
}
