import { Plugin } from "esbuild";

export interface Schema {
  buildTarget: string;
  plugins?: Plugin[];
}
