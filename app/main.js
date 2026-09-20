// Creates the Electron window and connects the backend to the UI
const {
    app,
    BrowserWindow,
    ipcMain
} = require("electron");

const path = require("path");

const ddas = require("./ddas");

let mainWindow;

// Creates the Electron desktop window.
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

// Sends saved records to the React interface.
ipcMain.handle("get-records", () => {
    return ddas.loadRecords();
});

// Starts Electron and DDAS monitoring.
app.whenReady().then(() => {

    createWindow();

    ddas.startDDAS();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Closes the application when all windows are closed.
app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }
});