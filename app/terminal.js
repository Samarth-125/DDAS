// Terminal entry point: runs DDAS without Electron or React.
const os = require("os");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const ddas = require("./ddas");
const downloadsPath = path.join(
    os.homedir(),
    "Downloads"
);
// Creates a terminal input/output interface.
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Moves a duplicate file to the macOS Trash.
function moveToTrash(fileName) {
    const filePath = path.join(
        downloadsPath,
        fileName
    );
    const trashPath = path.join(
        os.homedir(),
        ".Trash",
        fileName
    );
    try {
        fs.renameSync(filePath, trashPath);
        return true;
    } catch (error) {
        console.log("Could not move file to Trash.");
        return false;
    }
}
// Shows the duplicate options in the terminal.
function askDuplicateAction(file) {
    return new Promise((resolve) => {
        console.log("");
        console.log("⚠ DUPLICATE FILE DETECTED");
        console.log("--------------------------------");
        console.log("File:", file.name);
        console.log("Original:", file.original);
        console.log("Size:", file.size, "bytes");
        console.log("SHA-256:", file.hash);
        console.log("");
        console.log("1. Keep File");
        console.log("2. Move File to Trash");
        terminal.question(
            "Enter your choice: ",
            (answer) => {

                if (answer.trim() === "2") {
                    const moved = moveToTrash(file.name);
                    resolve(moved);
                } else {
                    resolve(false);
                }
            }
        );
    });
}
// Starts the terminal version of DDAS.
function startTerminalDDAS() {
    console.log("");
    console.log("================================");
    console.log("DDAS - Terminal Version");
    console.log("================================");
    console.log("");
    console.log("🟢 DDAS is running");
    console.log("Monitoring:", downloadsPath);
    console.log("");
    console.log("Press Ctrl+C to stop.");
    console.log("");
    ddas.startDDAS({
        downloadsPath: downloadsPath,
        // Displays DDAS activity in the terminal.
        onActivity: (activity) => {
            console.log("");
            if (activity.type === "new") {
                console.log("✓ NEW FILE");
            } else {
                console.log("⚠ DUPLICATE");
                console.log(
                    "Original:",
                    activity.original
                );
            }
            console.log("Name:", activity.name);
            console.log("Size:", activity.size, "bytes");
            console.log("SHA-256:", activity.hash);
            console.log("");
        },
        // Asks the terminal user what to do with a duplicate.
        onDuplicate: askDuplicateAction
    });
}
startTerminalDDAS();
// Handles Ctrl+C and closes the terminal interface.
process.on("SIGINT", () => {
    console.log("");
    console.log("DDAS stopped.");
    terminal.close();
    process.exit(0);
});