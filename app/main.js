const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const processingFiles = new Set();

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

function calculateHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (data) => {
            hash.update(data);
        });

        stream.on("end", () => {
            resolve(hash.digest("hex"));
        });

        stream.on("error", (error) => {
            reject(error);
        });
    });
}

function loadRecords() {
    const recordsPath = path.join(__dirname, "records.json");

    try {
        const data = fs.readFileSync(recordsPath, "utf-8");

        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveRecords(records) {
    const recordsPath = path.join(__dirname, "records.json");

    fs.writeFileSync(
        recordsPath,
        JSON.stringify(records, null, 4)
    );
}

async function checkFile(fileName) {
    if (processingFiles.has(fileName)) {
        return;
    }

    processingFiles.add(fileName);

    const downloadsPath = app.getPath("downloads");
    const filePath = path.join(downloadsPath, fileName);

    try {
        const stats = fs.statSync(filePath);

        if (!stats.isFile()) {
            return;
        }

        const hash = await calculateHash(filePath);

        console.log("--------------------------------");
        console.log("File:", fileName);
        console.log("Size:", stats.size, "bytes");
        console.log("SHA-256:", hash);

        const records = loadRecords();

        const duplicate = records.find((record) => {
            return record.hash === hash;
        });

        if (duplicate) {
            console.log("⚠ Duplicate detected!");
            console.log("Original file:", duplicate.name);

            const result = dialog.showMessageBoxSync({
                type: "warning",
                title: "Duplicate File Detected",
                message: "A duplicate file has been detected.",
                detail:
                    `File: ${fileName}\n\n` +
                    `Original file: ${duplicate.name}\n\n` +
                    "The files have the same content.",
                buttons: ["Keep File", "Delete File"],
                defaultId: 0,
                cancelId: 0
            });

            if (result === 1) {
                fs.unlinkSync(filePath);

                console.log("Duplicate file deleted.");
            } else {
                console.log("Duplicate file kept.");
            }
        } else {
            console.log("✓ New file");

            records.push({
                name: fileName,
                size: stats.size,
                hash: hash
            });

            saveRecords(records);

            console.log("File saved to records.json");
        }

        console.log("--------------------------------");
    } catch (error) {
        console.log("Could not process file:", fileName);
    } finally {
        processingFiles.delete(fileName);
    }
}

function watchDownloads() {
    const downloadsPath = app.getPath("downloads");

    console.log("Watching Downloads folder:");
    console.log(downloadsPath);

    fs.watch(downloadsPath, (eventType, fileName) => {
        if (!fileName) {
            return;
        }

        if (fileName === ".DS_Store") {
            return;
        }

        console.log("File detected:", fileName);

        setTimeout(() => {
            checkFile(fileName);
        }, 1000);
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