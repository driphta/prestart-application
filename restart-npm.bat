@echo off
echo [INFO] Checking for Node.js processes...
taskkill /F /IM "node.exe" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Stopped existing Node.js processes
) else (
    echo [INFO] No Node.js processes were running
)

echo [INFO] Changing to frontend directory...
cd frontend
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not find frontend directory!
    echo [ERROR] Make sure you're running this from the project root
    pause
    exit /b 1
)

echo [INFO] Starting npm development server...
start /B npm start
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start npm server!
    echo [ERROR] Check if Node.js is installed and npm dependencies are up to date
    pause
    exit /b 1
)

echo [SUCCESS] Development server started successfully!
echo [INFO] The app should be available at http://localhost:3333
echo [INFO] You can close this window now.
timeout /t 5
