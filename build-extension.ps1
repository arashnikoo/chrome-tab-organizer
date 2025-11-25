# Build script for Chrome Tab Organizer extension (PowerShell)
# Creates a zip file for distribution

$ExtensionName = "chrome-tab-organizer"
$ZipFile = "$ExtensionName.zip"

# Remove old zip if it exists
if (Test-Path $ZipFile) {
    Write-Host "Removing existing $ZipFile..."
    Remove-Item $ZipFile
}

# Get all files and folders from "extension" directory, excluding .git, markdown, and zip files
Write-Host "Creating $ZipFile from ./extension..."
$FilesToZip = Get-ChildItem -Path ./extension -Recurse | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and
    $_.FullName -notmatch '\\\.git$' -and
    $_.Extension -ne '.md' -and
    $_.Extension -ne '.zip'
}

# Create the zip file
Compress-Archive -Path $FilesToZip.FullName -DestinationPath $ZipFile -Force

Write-Host "Build complete! Created $ZipFile"
