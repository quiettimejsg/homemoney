@echo off
setlocal enabledelayedexpansion

:: ======================
:: One-click Server Startup Script
:: ======================
set SERVER_PORT=3010

:: Validate server directory
if not exist "server" (
    echo Error: Server directory not found
    pause
    exit /b 1
)

:: ======================
:: Start Server
:: ======================
start "Server" cmd /k "cd server && echo Starting server... && npm run start"

:: Wait for server to start with timeout
echo Waiting for server to start (up to 30 seconds)...
set "max_attempts=30"
set "attempt=0"
set SERVER_STATUS=Not Responding
:check_server_loop
timeout /t 1 /nobreak >nul
set /a attempt+=1
netstat -ano | findstr ":%SERVER_PORT%" >nul
if !errorlevel! equ 0 (
    set SERVER_STATUS=Running
    goto server_started
)
if !attempt! geq !max_attempts! (
    goto server_started
)
goto check_server_loop
:server_started

:: ======================
:: Display Results
:: ======================
echo.
echo ========================================
echo          Server Startup Report
echo ========================================
echo Status: %SERVER_STATUS%
echo Port: %SERVER_PORT%
echo.
echo ========================================
echo Press any key to continue...
pause >nul

endlocal