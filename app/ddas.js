// Main DDAS logic: watches Downloads, hashes files, detects duplicates
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
// Stores files that are currently being checked.
const processingFiles = new Set();
// Prevents the same file event from being processed repeatedly.
const recentlyProcessed = new Map();
// Stores the Downloads folder being monitored.
let downloadsPath;
// Stores functions used by Electron or Terminal when activity happens.
let onActivity;
let onDuplicate;

// Creates a SHA-256 fingerprint from the file contents.
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

// Reads previously stored file records.
function loadRecords() {
    const recordsPath = path.join(__dirname, "records.json");

    try {
        const data = fs.readFileSync(recordsPath, "utf-8");
        const records = JSON.parse(data);

        // Removes records for files that no longer exist.
        const activeRecords = records.filter((record) => {
            const filePath = path.join(
                downloadsPath,
                record.name
            );

            return fs.existsSync(filePath);
        });

        if (activeRecords.length !== records.length) {
            saveRecords(activeRecords);
        }
        return activeRecords;
    } catch (error) {
        return [];
    }
}

// Saves file records to the JSON file.
function saveRecords(records) {
    const recordsPath = path.join(__dirname, "records.json");
    fs.writeFileSync(
        recordsPath,JSON.stringify(records, null, 4)
    );
}

// Waits until the file size stops changing before processing it.
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
                setTimeout(checkSize, 100);
            });
        }

        checkSize();
    });
}

// Checks a downloaded file and determines whether it is a duplicate.
async function checkFile(fileName) {
    if (processingFiles.has(fileName)) {
        return;
    }
    const lastProcessed = recentlyProcessed.get(fileName);
    if (
        lastProcessed && Date.now() - lastProcessed < 3000
    ) {
        return;
    }
    processingFiles.add(fileName);
    const filePath = path.join(
        downloadsPath,fileName
    );

    try {
        const stats = await waitForFile(filePath);
        const hash = await calculateHash(filePath);
        console.log("--------------------------------");
        console.log("File:", fileName);
        console.log("Size:", stats.size, "bytes");
        console.log("SHA-256:", hash);
        const records = loadRecords();

        // Looks for an existing file with the same SHA-256 hash.
        const duplicate = records.find((record) => {
            return record.hash === hash;
        });

        if (duplicate) {
            console.log("⚠ Duplicate detected!");
            console.log("Original file:", duplicate.name);

            if (onActivity) {
                onActivity({
                    type: "duplicate",
                    name: fileName,
                    original: duplicate.name,
                    size: stats.size,
                    hash: hash
                });
            }

            // Asks the current interface whether the duplicate should be deleted.
            const shouldDelete = onDuplicate
                ? await onDuplicate({
                    name: fileName,
                    original: duplicate.name,
                    size: stats.size,
                    hash: hash
                })
                : false;

            if (shouldDelete) {
                console.log("Duplicate file moved to Trash.");
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

            if (onActivity) {
                onActivity({
                    type: "new",
                    name: fileName,
                    size: stats.size,
                    hash: hash
                });
            }
        }

        console.log("--------------------------------");
        recentlyProcessed.set(
            fileName,
            Date.now()
        );

    } catch (error) {
        console.log("Could not process file:",fileName);
    } finally {
        processingFiles.delete(fileName);
    }
}

// Watches the Downloads folder for new files.
function watchDownloads() {
    console.log("Watching Downloads folder:");
    console.log(downloadsPath);

    fs.watch(
        downloadsPath,
        (eventType, fileName) => {
            if (!fileName) {
                return;
            }

            // Ignores macOS Finder files.
            if (fileName === ".DS_Store") {
                return;
            }
            console.log("File detected:",fileName);
            checkFile(fileName);
        }
    );
}
// Starts monitoring the Downloads folder.
function startDDAS(options) {
    downloadsPath = options.downloadsPath;
    onActivity = options.onActivity;
    onDuplicate = options.onDuplicate;
    watchDownloads();
}
module.exports = {
    startDDAS,
    loadRecords
};