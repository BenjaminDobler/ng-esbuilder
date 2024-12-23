import { BrowserWindow, app } from 'electron';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  win.loadFile('renderer/my.electron.app.renderer/browser/index.html');
};

app.whenReady().then(() => {
  createWindow();
});


