import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron'
import path from 'path'
import { PythonBridge } from './python-bridge'
import { setupIpcHandlers } from './ipc-handlers'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let pythonBridge: PythonBridge | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: '退出', click: () => { tray = null; app.quit() } }
  ])

  tray.setToolTip('MiniMax Desktop')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

app.whenReady().then(async () => {
  pythonBridge = new PythonBridge()
  await pythonBridge.start()

  setupIpcHandlers(ipcMain, pythonBridge, mainWindow)
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', async () => {
  await pythonBridge?.stop()
})
