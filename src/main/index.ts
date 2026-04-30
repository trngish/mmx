import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron'
import path from 'path'

// PythonBridge placeholder - will be implemented in Task 8
class PythonBridge {
  async initialize(): Promise<void> {
    console.log('PythonBridge.initialize called')
  }

  async sendMessage(channel: string, message: string): Promise<string> {
    console.log('PythonBridge.sendMessage called', channel, message)
    return ''
  }

  stop(): void {
    console.log('PythonBridge.stop called')
  }
}

const pythonBridge = new PythonBridge()

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function createTray() {
  const icon = nativeImage.createEmpty()
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0]
        if (win) {
          win.show()
        }
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('MiniMax Desktop')
  tray.setContextMenu(contextMenu)
}

function setupIpcHandlers() {
  // Will be implemented in Task 8
  console.log('setupIpcHandlers called')
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  setupIpcHandlers()
  pythonBridge.initialize()
})

app.on('before-quit', () => {
  pythonBridge.stop()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
