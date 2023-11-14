const fs = require("fs-extra");
const path = require("path");



function linkToNodeModules(fromPath, toPath) {
    const parentToDir = path.dirname(toPath);
    fs.ensureDirSync(parentToDir);
    const doesExist = fsE.existsSync(toPath) || fsE.lstatSync(toPath).isSymbolicLink();
    console.log("Does exist", doesExist);
    if (fs.existsSync(path.resolve(fromPath) && !doesExist)) {
        try {
          fs.symlinkSync(path.resolve(fromPath), path.resolve(toPath), "junction");
        } catch (e) {
            console.log(e);
        }
      }
}

linkToNodeModules("./dist/builder/electron/", "./node_modules/@richapps/builder.electron");