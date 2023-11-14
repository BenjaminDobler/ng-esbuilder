const copy = require("copy");
const fs = require("fs-extra");
const path = require("path");
const projectName = process.argv[2].split("=")[1];

fs.removeSync(`./dist/builder.${projectName}`);

console.log(process.argv);
console.log("projectName", projectName);

copy(
  `./builder/${projectName}/src/**/*.json`,
  `./dist/builder/${projectName}/lib`,
  function (err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
  }
);

copy(
  `./builder/${projectName}/*.json`, 
  `./dist/builder/${projectName}`,
  function (err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
  }
);

function linkToNodeModules(fromPath, toPath) {
    const parentToDir = path.dirname(toPath);
    console.log('parentToDir', parentToDir);
    fs.ensureDirSync(parentToDir);
    console.log('yup');
    const doesExist = fs.existsSync(toPath);
    console.log('doesExist', doesExist);

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
