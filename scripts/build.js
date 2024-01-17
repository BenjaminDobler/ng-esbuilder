const copy = require("copy");
const fs = require("fs-extra");
const path = require("path");
const projectName = process.argv[2].split("=")[1];

fs.removeSync(`./dist/builder.${projectName}`);

copy(
  `./projects/builder/${projectName}/src/**/*.json`,
  `./dist/builder/${projectName}/`,
  function (err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
  }
);

copy(
  `./projects/builder/${projectName}/*.json`,
  `./dist/builder/${projectName}`,
  function (err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
  }
);

copy(
  `./projects/builder/${projectName}/src/schematics/**/files/**/*`,
  `./dist/builder/${projectName}/schematics/`,
  function (err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
  }
);

function linkToNodeModules(fromPath, toPath) {
  const parentToDir = path.dirname(toPath);
  fs.ensureDirSync(parentToDir);
  const doesExist = fs.existsSync(toPath);

  if (fs.existsSync(path.resolve(fromPath)) && !doesExist) {
    try {
      fs.symlinkSync(path.resolve(fromPath), path.resolve(toPath), "junction");
    } catch (e) {
      console.log(e);
    }
  }
}

try {
  linkToNodeModules(
    `./dist/builder/${projectName}/`,
    `./node_modules/@richapps/builder.${projectName}`
  );
} catch (e) {
  console.log(e);
}
