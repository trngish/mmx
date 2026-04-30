import { contextBridge, ipcRenderer } from 'electron';

export interface IPC {
  sendMessage: (msg: object) => Promise<void>;
  onPythonMessage: (callback: (msg: object) => void) => void;
  getAppVersion: () => Promise<string>;
  getMediaDir: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

const ipc: IPC = {
  sendMessage: (msg) => ipcRenderer.invoke('send-message', msg),
  onPythonMessage: (callback) => {
    ipcRenderer.on('python-message', (_event, msg) => callback(msg));
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getMediaDir: () => ipcRenderer.invoke('get-media-dir'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
};

contextBridge.exposeInMainWorld('ipc', ipc);

declare global {
  interface Window {
    ipc: IPC;
  }
}