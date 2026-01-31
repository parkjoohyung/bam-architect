@echo off
title Law Data Auto-Updater
echo ==========================================
echo       Bam Architect - Law Data Updater
echo ==========================================
echo.
echo Starting update process...
echo This window will close automatically when finished.
echo.

cd /d "%~dp0"
call npm install puppeteer --no-save >nul 2>&1

node update_laws.js

echo.
echo Update process finished.
pause
