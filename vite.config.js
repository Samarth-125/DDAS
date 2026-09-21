const { defineConfig } = require("vite");
const path = require("path");
// Configures Vite to build the React interface for Electron.
module.exports = defineConfig({
    // Uses relative paths so Electron can load the files locally.
    base: "./",
    build: {
        outDir: "dist"
    }
});