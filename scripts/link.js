const fs = require("fs-extra");
const path = require("path");



function linkToNodeModules(fromPath, toPath) {
  const parentToDir = path.dirname(toPath);
  fs.ensureDirSync(parentToDir);
  if (fs.existsSync(path.resolve(fromPath))) {
    try {
      fs.symlinkSync(path.resolve(fromPath), path.resolve(toPath), "junction");
    } catch (e) {
    }
  } else {
    console.log('exists already');
  }
}

linkToNodeModules("./dist/builder/electron/", "./node_modules/@richapps/builder.electron");
linkToNodeModules("./dist/builder/node/", "./node_modules/@richapps/builder.node");