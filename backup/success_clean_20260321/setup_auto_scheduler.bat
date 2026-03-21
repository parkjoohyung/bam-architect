@echo off
echo Registering 'BamArchitect_LawUpdate' task...
echo Runs every Monday at 09:00 AM.
echo.

set TASK_NAME=BamArchitect_LawUpdate
set SCRIPT_PATH=%~dp0update.bat

schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc weekly /d MON /st 09:00 /f

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Task registered successfully!
    echo Your law data will now update automatically every Monday morning.
) else (
    echo.
    echo [ERROR] Failed to register task. Please run this file as Administrator.
)

pause
