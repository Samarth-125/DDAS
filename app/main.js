// Electron entry point: creates the desktop window and connects DDAS to React.
const {app,BrowserWindow,dialog,ipcMain} = require("electron");
const path = require("path");
const fs = require("fs");
const ddas = require("./ddas");
let mainWindow;
// Creates the Electron desktop window.
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        // Electron uses preload.js as the safe bridge to React.
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    // Loads the React application built by Vite.
    mainWindow.loadFile(
        path.join(__dirname, "../dist/index.html")
    );
}
// Sends saved records from DDAS to React through Electron IPC.
ipcMain.handle("get-records", () => {
    return ddas.loadRecords();
});
// Starts Electron and DDAS monitoring.
app.whenReady().then(() => {
    createWindow();
    ddas.startDDAS({
        // Electron gets the Downloads folder from the operating system.
        downloadsPath: app.getPath("downloads"),
        // Sends DDAS activity to the React interface.
        onActivity: (activity) => {
            if (mainWindow) {
                mainWindow.webContents.send(
                    "file-activity",
                    activity
                );
            }
        },
        // Shows the Electron duplicate dialog.
        onDuplicate: async (file) => {
            const result = dialog.showMessageBoxSync({
                type: "warning",
                title: "Duplicate File Detected",
                message: "A duplicate file has been detected.",
                detail:
                    `File: ${file.name}\n\n` +
                    `Original file: ${file.original}\n\n` +
                    "The files have the same content.",
                buttons: ["Keep File","Delete File"],
                defaultId: 0,
                cancelId: 0
            });
            if (result === 1) {
                // Electron provides this API to move a file to macOS Trash.
                const { shell } = require("electron");
                const filePath = path.join(
                    app.getPath("downloads"),
                    file.name
                );
                await shell.trashItem(filePath);
                return true;
            }
            return false;
        }
    });
    // macOS can recreate the window when the app is activated.
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Closes Electron when all windows are closed.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});