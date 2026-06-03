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

echo Scraping latest Annex 1 to Excel...
node scripts/scrape_annex_one.js

echo Updating national laws data...
node scripts/update_laws.js

echo Updating building types data...
node scripts/convert_building_types.js

echo Updating ordinance data (local bylaws)...
node scripts/scrape_ordinance.js

echo.
echo Update process finished.
pause
