const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const window = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    window.loadFile(path.join(__dirname, "../index.html"));
}

function watchDownloads() {
    const downloadsPath = app.getPath("downloads");

    console.log("Watching Downloads folder:");
    console.log(downloadsPath);

    fs.watch(downloadsPath, (eventType, fileName) => {
        if (fileName) {
            console.log("File detected:", fileName);
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    watchDownloads();

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