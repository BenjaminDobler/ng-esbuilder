import { BrowserWindow, app } from 'electron';

console.log('this is the index test file hallo dsdsdsd');
console.log('yeah hello');
console.log('whats up');

process.on('message', (message) => {
  console.log('message from child ', message);
  process.send(`pong`);

});
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  win.loadFile('renderer/frontend/browser/index.html');
};

app.whenReady().then(() => {
  createWindow();
});
