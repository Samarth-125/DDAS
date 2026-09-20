const {app,BrowserWindow,ipcMain} = require("electron");
const path = require("path");
const ddas = require("./ddas");
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, "../dist/index.html")
    );

    ddas.setWindow(mainWindow);
}

ipcMain.handle("get-records", () => {
    return ddas.loadRecords();
});

app.whenReady().then(() => {
    createWindow();
    ddas.startDDAS();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});