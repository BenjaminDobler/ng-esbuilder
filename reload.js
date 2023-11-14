// import esbuild from "esbuild";

const esbuild = require("esbuild");

async function run() {
  const liveReload = {
    name: "liveReload",
    setup(build) {
      build.onEnd((result) => {
        console.log("build ended");
      });

      build.onStart((result) => {
        console.log("build started");
      });
    },
  };

  const BUILD_CONFIG = {
    entryPoints: ["./projects/nodetest/src/index.ts"],
    outfile: "./dist/nodetest/index.js",
    plugins: [liveReload],
  };

  let ctx = await esbuild.context(BUILD_CONFIG);

  await ctx.watch();
}

run();