# Data Download Duplication Alert System (DDAS)

DDAS is a desktop application that monitors the Downloads folder and detects duplicate files using SHA-256 hashing.

## Features

- Monitors the Downloads folder
- Detects newly downloaded files
- Waits for the download to finish
- Generates a SHA-256 hash from file contents
- Compares files with previously recorded files
- Detects duplicate files even when their names are different
- Shows a duplicate file alert
- Allows the user to keep or delete the duplicate
- Stores file records locally in a JSON file
- Displays recent activity in the desktop interface

## How It Works

```text
File Download
      ↓
Downloads Folder Monitoring
      ↓
File Detection
      ↓
Wait for Download Completion
      ↓
SHA-256 Hash Generation
      ↓
Compare With Stored Hashes
      ↓
 ┌───────────────┐
 │ Duplicate?    │
 └───────┬───────┘
         │
    ┌────┴────┐
    ↓         ↓
   No        Yes
    ↓         ↓
Save Record  Show Alert
              ↓
          Keep / Delete