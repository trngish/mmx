import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  sendMessage: (msg: object) => ipcRenderer.invoke('send-message', msg),
  onPythonMessage: (callback: (msg: object) => void) => {
    ipcRenderer.on('python-message', (_event, msg) => callback(msg));
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getMediaDir: () => ipcRenderer.invoke('get-media-dir'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});