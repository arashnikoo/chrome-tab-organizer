#!/bin/bash
# Build script for Chrome Tab Organizer extension
# Creates a zip file for distribution

# Get the directory name for the zip file
EXTENSION_NAME="chrome-tab-organizer"
ZIP_FILE="${EXTENSION_NAME}.zip"

# Remove old zip if it exists
if [ -f "$ZIP_FILE" ]; then
    echo "Removing existing $ZIP_FILE..."
    rm "$ZIP_FILE"
fi

# Create zip file from src folder, excluding .git folder and build scripts
echo "Creating $ZIP_FILE from ./src..."
cd src
zip -r "../$ZIP_FILE" . \
    -x "*.git*" \
    -x "*.md" \
    -x "*.zip"
cd ..

echo "Build complete! Created $ZIP_FILE"
