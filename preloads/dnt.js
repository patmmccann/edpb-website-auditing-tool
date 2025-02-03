const { ipcRenderer, contextBridge } = require('electron');

ipcRenderer.on('dntJs', (event, messages) => {
    contextBridge.exposeInMainWorld(
        'navigator',
        {
            doNotTrack: 1
        });
});