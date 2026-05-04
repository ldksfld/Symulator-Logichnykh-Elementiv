import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveCircuit: (payload: { name: string; data: string }) =>
    ipcRenderer.invoke('circuit:save', payload),

  loadCircuit: () => ipcRenderer.invoke('circuit:load'),

  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:write', text),

  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
})
