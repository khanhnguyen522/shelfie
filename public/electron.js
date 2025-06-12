const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 350,
    height: 500,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadURL("http://localhost:3001");
  win.setMennu(null);
}
app.whenReady().then(createWindow);
