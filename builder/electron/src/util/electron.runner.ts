import { ChildProcess, spawn } from 'child_process';

export class ElectronRunner {
  electronProcess: ChildProcess;

  runElectron(dir) {
    if (this.electronProcess) {
      this.electronProcess.kill();
    }

    const electronPath = require('electron');
    console.log('electronPath', electronPath);
    this.electronProcess = spawn(electronPath, [dir], { stdio: [0, 'pipe', 'pipe', 'ipc'] });
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

  send(message) {
    if (this.electronProcess) {
      console.log('send message');
      this.electronProcess.send(message);
    }
  }
}
