// Safely connects Electron/Node.js with React
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("ddas", {
    getRecords: () => {
        return ipcRenderer.invoke("get-records");
    },

    onFileActivity: (callback) => {
        ipcRenderer.on("file-activity", (event, activity) => {
            callback(activity);
        });
    }

});