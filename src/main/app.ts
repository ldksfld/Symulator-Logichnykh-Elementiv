import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { createWindow } from './window'
import { registerIpcHandlers } from './ipc-handlers'

process.on('uncaughtException', (error) => {
  const logDir = join(app.getPath('userData'), 'logs')

  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }

  const logFile = join(logDir, 'error.log')
  const entry = `[${new Date().toISOString()}] ${error.stack || error.message}\n`

  try {
    writeFileSync(logFile, entry, { flag: 'a' })
  } catch {
  }
})

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
      event.preventDefault()
    }
  })

  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }

    return { action: 'deny' }
  })
})
