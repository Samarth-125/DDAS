const { app, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

let mainWindow;

// Keeps track of files currently being processed.
const processingFiles = new Set();

// Prevents the same file event from being processed repeatedly.
const recentlyProcessed = new Map();

function setWindow(window) {
    mainWindow = window;
}

// Creates a SHA-256 hash from the file contents.
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

// Reads saved file records from records.json.
function loadRecords() {
    const recordsPath = path.join(__dirname, "records.json");

    try {
        const data = fs.readFileSync(recordsPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Saves file records to records.json.
function saveRecords(records) {
    const recordsPath = path.join(__dirname, "records.json");

    fs.writeFileSync(
        recordsPath,
        JSON.stringify(records, null, 4)
    );
}

// Sends file activity from Electron to the React interface.
function sendActivity(activity) {
    if (mainWindow) {
        mainWindow.webContents.send(
            "file-activity",
            activity
        );
    }
}

// Waits until the file size stops changing.
function waitForFile(filePath) {
    return new Promise((resolve, reject) => {
        let previousSize = -1;

        function checkSize() {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!stats.isFile()) {
                    reject(new Error("Not a file"));
                    return;
                }

                if (stats.size === previousSize) {
                    resolve(stats);
                    return;
                }

                previousSize = stats.size;

                setTimeout(checkSize, 300);
            });
        }

        checkSize();
    });
}

// Checks a detected file for duplicates.
async function checkFile(fileName) {
    if (processingFiles.has(fileName)) {
        return;
    }

    const lastProcessed = recentlyProcessed.get(fileName);

    if (
        lastProcessed &&
        Date.now() - lastProcessed < 3000
    ) {
        return;
    }

    processingFiles.add(fileName);

    const downloadsPath = app.getPath("downloads");
    const filePath = path.join(downloadsPath, fileName);

    try {
        const stats = await waitForFile(filePath);

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

            sendActivity({
                type: "duplicate",
                name: fileName,
                original: duplicate.name,
                size: stats.size,
                hash: hash
            });

            const result = dialog.showMessageBoxSync({
                type: "warning",
                title: "Duplicate File Detected",
                message: "A duplicate file has been detected.",
                detail:
                    `File: ${fileName}\n\n` +
                    `Original file: ${duplicate.name}\n\n` +
                    "The files have the same content.",
                buttons: [
                    "Keep File",
                    "Delete File"
                ],
                defaultId: 0,
                cancelId: 0
            });

            if (result === 1) {
                fs.unlinkSync(filePath);

                console.log(
                    "Duplicate file deleted."
                );
            } else {
                console.log(
                    "Duplicate file kept."
                );
            }

        } else {
            console.log("✓ New file");

            records.push({
                name: fileName,
                size: stats.size,
                hash: hash
            });

            saveRecords(records);

            console.log(
                "File saved to records.json"
            );

            sendActivity({
                type: "new",
                name: fileName,
                size: stats.size,
                hash: hash
            });
        }

        console.log("--------------------------------");

        recentlyProcessed.set(
            fileName,
            Date.now()
        );

    } catch (error) {
        console.log(
            "Could not process file:",
            fileName
        );

    } finally {
        processingFiles.delete(fileName);
    }
}

// Watches the Downloads folder for new files.
function watchDownloads() {
    const downloadsPath = app.getPath("downloads");

    console.log("Watching Downloads folder:");
    console.log(downloadsPath);

    fs.watch(
        downloadsPath,
        (eventType, fileName) => {

            if (!fileName) {
                return;
            }

            // Ignore macOS Finder files.
            if (fileName === ".DS_Store") {
                return;
            }

            console.log(
                "File detected:",
                fileName
            );

            checkFile(fileName);
        }
    );
}

// Starts DDAS file monitoring.
function startDDAS() {
    watchDownloads();
}

module.exports = {
    setWindow,
    startDDAS,
    loadRecords
};