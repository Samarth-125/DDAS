// Safely connects Electron/Node.js with React
const { contextBridge, ipcRenderer } = require("electron");

// Provides safe communication between React and Electron.
contextBridge.exposeInMainWorld("ddas", {
    // Gets saved file records from Electron.
    getRecords: () => {
        return ipcRenderer.invoke("get-records");
    },
    // Receives file activity from the DDAS backend.
    onFileActivity: (callback) => {
        ipcRenderer.on("file-activity", (event, activity) => {
            callback(activity);
        });
    }
});