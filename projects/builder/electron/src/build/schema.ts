
export interface RendererTarget {
  target: string;
}

export interface Schema {
  rendererTargets: RendererTarget[];
  outputPath: string;
  mainTarget:string;
  packageJson: string;
  watch: boolean;
}
