import { ipcMain, dialog, clipboard, app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface SaveCircuitPayload {
  name: string
  data: string
}

function isValidCircuitJSON(raw: string): boolean {
  try {
    const obj = JSON.parse(raw)
    return (
      typeof obj === 'object' &&
      obj !== null &&
      Array.isArray(obj.nodes) &&
      Array.isArray(obj.edges)
    )
  } catch {
    return false
  }
}

export function registerIpcHandlers(): void {
  ipcMain.handle('circuit:save', async (_event, payload: unknown) => {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof (payload as SaveCircuitPayload).name !== 'string' ||
      typeof (payload as SaveCircuitPayload).data !== 'string'
    ) {
      return { success: false, error: 'Невірний формат даних' }
    }
    const { name, data } = payload as SaveCircuitPayload
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Зберегти схему',
      defaultPath: `${name}.json`,
      filters: [{ name: 'JSON схема', extensions: ['json'] }],
    })
    if (canceled || !filePath) return { success: false, error: 'Скасовано' }
    try {
      writeFileSync(filePath, data, 'utf-8')
      return { success: true }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('circuit:load', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Відкрити схему',
      filters: [{ name: 'JSON схема', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (canceled || filePaths.length === 0) return { success: false, error: 'Скасовано' }
    try {
      const raw = readFileSync(filePaths[0], 'utf-8')
      if (!isValidCircuitJSON(raw)) {
        return { success: false, error: 'Невірний формат файлу схеми' }
      }
      return { success: true, data: raw }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('clipboard:write', (_event, text: unknown) => {
    if (typeof text !== 'string') return false
    clipboard.writeText(text)
    return true
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())
}
