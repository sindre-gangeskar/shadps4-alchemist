const { contextBridge, ipcRenderer, remote } = require('electron');
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (...args) => func(...args))
    },
    getJsonData: () => ipcRenderer.invoke('get-json-data'),
    minimizeWindow: () => { ipcRenderer.invoke('minimize-window') },
    maximizeWindow: () => { ipcRenderer.invoke('maximize-window') },
    maximizeStatus: () => { ipcRenderer.invoke('maximize-status') },
})