import { ChildProcess, spawn } from 'child_process';

export class ElectronRunner {
  electronProcess: ChildProcess;

  constructor(private outputPath: string) {

  }
  runElectron() {
    if (this.electronProcess) {
      this.electronProcess.kill();
    }

    const electronPath = require('electron');
    this.electronProcess = spawn(electronPath, [this.outputPath], { stdio: [0, 'pipe', 'pipe', 'ipc'] });
    if (this.electronProcess.stdout && this.electronProcess.stderr && this.electronProcess.on) {
      this.electronProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      this.electronProcess.stderr.on('data', (data) => {
        console.log(data.toString());
      });
      this.electronProcess.on('message', (message) => {
        console.log('message from child ', message);
      });
      this.electronProcess.on('exit', (code) => {});
    }
  }

  reloadMain() {
    if (!this.electronProcess) {
      this.runElectron();
    } else {
      // TODO: reload main process
      this.electronProcess.kill();
      this.runElectron();
    }
  }

  reloadWindows() {
    if (this.electronProcess) {
      this.electronProcess.send('@richapps/builder.electron:ipc:reload');
    }
  }
}
