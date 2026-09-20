const { defineConfig } = require("vite");

// Vite configuration for the React interface.
module.exports = defineConfig({
    // Use relative paths so Electron can load the built files locally.
    base: "./",

    build: {
        outDir: "dist"
    }
});