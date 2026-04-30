import { IpcMain, BrowserWindow } from 'electron';
import { PythonBridge } from './python-bridge';

export function setupIpcHandlers(
  ipcMain: IpcMain,
  pythonBridge: PythonBridge,
  mainWindow: BrowserWindow | null
) {
  // Forward renderer message to Python
  ipcMain.handle('send-message', async (_event, message: object) => {
    pythonBridge.send(message);
  });

  // Python -> Renderer relay
  pythonBridge.onMessage((msg) => {
    mainWindow?.webContents.send('python-message', msg);
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  // Open external link
  ipcMain.handle('open-external', (_event, url: string) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  });

  // Get media directory
  ipcMain.handle('get-media-dir', () => {
    const { app } = require('electron');
    const path = require('path');
    const mediaDir = path.join(app.getPath('userData'), 'media');
    return mediaDir;
  });
}