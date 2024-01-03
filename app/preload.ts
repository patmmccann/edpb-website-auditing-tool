// Preload (Isolated World)
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'electron',
  {
    createCollector: (analysis_id : number, tag_id : number, url : string, args : any) => ipcRenderer.invoke('createCollector', analysis_id, tag_id, url, args),
    deleteCollector: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('deleteCollector', analysis_id, tag_id),
    eraseSession: (analysis_id : number, tag_id : number, args : any) => ipcRenderer.invoke('eraseSession', analysis_id, tag_id, args),
    showSession: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('showSession', analysis_id, tag_id),
    getSessions: () => ipcRenderer.invoke('getSessions'),
    hideSession: () => ipcRenderer.invoke('hideSession'),
    resizeSession: (rect : any) => ipcRenderer.invoke('resizeSession', rect),
    loadURL: (analysis_id : number, tag_id : number, url : string) => ipcRenderer.invoke('loadURL', analysis_id, tag_id, url),
    getURL: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('getURL', analysis_id, tag_id),
    get: (analysis_id : number, tag_id : number, kind, waitForComplete, args : any) => ipcRenderer.invoke('get', analysis_id, tag_id, kind, waitForComplete, args),
    screenshot: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('screenshot', analysis_id, tag_id),
    stop: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('stop', analysis_id, tag_id),
    refresh: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('refresh', analysis_id, tag_id),
    backward: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('backward', analysis_id, tag_id),
    forward: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('forward', analysis_id, tag_id),
    canGoBackward: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('canGoBackward', analysis_id, tag_id),
    canGoForward: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('canGoForward', analysis_id, tag_id),
    toogleDevTool: (analysis_id : number, tag_id : number) => ipcRenderer.invoke('toogleDevTool', analysis_id, tag_id),
    renderPug: (template, data) => ipcRenderer.invoke('renderPug', template, data),
    parseHar: (har, args : any) => ipcRenderer.invoke('parseHar', har, args),
    print_to_docx: (htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string) => ipcRenderer.invoke('print_to_docx', htmlString, headerHTMLString, documentOptions, footerHTMLString),
    print_to_pdf: (htmlString: string, headerHTMLString: string, documentOptions:any, footerHTMLString:string) => ipcRenderer.invoke('print_to_pdf', htmlString, headerHTMLString, documentOptions, footerHTMLString),
    subscriveToBrowserEvent: (callback) => {
      ipcRenderer.on('browser-event', (event, ...args) => {
        callback([...args]);
      })
    }
  }
)
