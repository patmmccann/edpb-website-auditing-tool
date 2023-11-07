// Preload (Isolated World)
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    createCollector: (analysis_id, tag_id, url, args) => ipcRenderer.invoke('createCollector', analysis_id, tag_id, url, args),
    deleteCollector: (analysis_id, tag_id) => ipcRenderer.invoke('deleteCollector', analysis_id, tag_id),
    eraseSession: (analysis_id, tag_id, args) => ipcRenderer.invoke('eraseSession', analysis_id, tag_id, args),
    showSession: (analysis_id, tag_id) => ipcRenderer.invoke('showSession', analysis_id, tag_id),
    getSessions: () => ipcRenderer.invoke('getSessions'),
    hideSession: () => ipcRenderer.invoke('hideSession'),
    resizeSession: (rect) => ipcRenderer.invoke('resizeSession', rect),
    loadURL: (analysis_id, tag_id, url) => ipcRenderer.invoke('loadURL', analysis_id, tag_id, url),
    getURL: (analysis_id, tag_id) => ipcRenderer.invoke('getURL', analysis_id, tag_id),

    save: (analysis_id, tag_id) => ipcRenderer.invoke('save', analysis_id, tag_id),
    get: (analysis_id, tag_id, kind, waitForComplete,args) => ipcRenderer.invoke('get', analysis_id, tag_id,kind, waitForComplete,args),
    screenshot: (analysis_id, tag_id) => ipcRenderer.invoke('screenshot', analysis_id, tag_id),
    stop: (analysis_id, tag_id) => ipcRenderer.invoke('stop', analysis_id, tag_id),
    refresh: (analysis_id, tag_id) => ipcRenderer.invoke('refresh', analysis_id, tag_id),
    backward: (analysis_id, tag_id) => ipcRenderer.invoke('backward', analysis_id, tag_id),
    forward: (analysis_id, tag_id) => ipcRenderer.invoke('forward', analysis_id, tag_id),
    canGoBackward: (analysis_id, tag_id) => ipcRenderer.invoke('canGoBackward', analysis_id, tag_id),
    canGoForward: (analysis_id, tag_id) => ipcRenderer.invoke('canGoForward', analysis_id, tag_id),
    renderPug: (template, data) => ipcRenderer.invoke('renderPug', template, data),
    parseHar: (har, args) => ipcRenderer.invoke('parseHar', har, args),
    export: (format, html) => ipcRenderer.invoke('export', format, html),
    subscriveToBrowserEvent : (callback) =>{
      ipcRenderer.on('browser-event', (event, ...args) => {
        callback([...args]);
      })
    }
  }
)