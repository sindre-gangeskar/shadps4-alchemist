const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (...args) => func(...args))
    },
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
    getJsonData: async () => await ipcRenderer.invoke('get-json-data'),
    minimizeWindow: () => { ipcRenderer.invoke('minimize-window') },
    maximizeWindow: () => { ipcRenderer.invoke('maximize-window') },
    maximizeStatus: () => { ipcRenderer.invoke('maximize-status') },
})