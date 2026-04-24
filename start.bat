@echo off
REM FluentAR launcher. Keep this file ASCII / no fancy parens inside if-blocks
REM because cmd.exe parses parens by line, and unescaped ( ) inside a grouped
REM block will silently break the whole script and close the window instantly.

setlocal enabledelayedexpansion

REM Always operate from the folder this script lives in.
pushd "%~dp0" 1>nul 2>nul
if errorlevel 1 (
  echo [ERROR] Could not change to script directory: %~dp0
  goto :wait_and_exit
)

echo ==============================================
echo   FluentAR - personal launcher (iOS + web)
echo ==============================================
echo.
echo   For Windows browser only, web.bat is faster
echo   and opens the browser automatically.
echo.

REM --- OneDrive note --------------------------------------------------------
echo "%CD%" | findstr /I "OneDrive" >nul
if not errorlevel 1 (
  echo [note] This project is inside OneDrive.
  echo        If Expo throws file watcher errors like EPERM or EBUSY,
  echo        pause OneDrive sync or move the folder outside OneDrive.
  echo.
)

REM --- 1. Node + npm checks -------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on PATH.
  echo         Install the LTS from https://nodejs.org then re-run this script.
  goto :wait_and_exit
)
for /f "delims=" %%v in ('node --version') do set "NODE_VER=%%v"
echo Node detected: !NODE_VER!

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found on PATH. It usually ships with Node.js.
  goto :wait_and_exit
)
echo.

REM --- 2. Install on first run ----------------------------------------------
if not exist "node_modules" (
  echo First-time setup: running npm install. This takes 2-5 minutes.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    echo         The most common cause on Windows is the better-sqlite3 native
    echo         build needing Visual Studio Build Tools. Install "Desktop
    echo         development with C++" via the Visual Studio Installer, then
    echo         re-run this script.
    echo.
    echo         Mobile-only fallback if you do not need backend sync:
    echo             npm install --workspace=mobile
    echo             npm run mobile
    goto :wait_and_exit
  )
  echo.
)

REM --- 3. Optional backend in its own window --------------------------------
REM Using "cmd /k" keeps the new window open after npm exits, so any error is
REM readable. No compound commands here - they are the easiest thing to break.
echo Starting personal cloud backend in a new window. Close it any time.
start "FluentAR Backend" cmd /k npm run backend

REM Small pause so the backend's startup logs do not race the Expo banner.
timeout /t 3 /nobreak >nul

REM --- 4. Expo (mobile) in this window --------------------------------------
echo.
echo Launching Expo Dev Tools. Once it loads, you have two ways to open the app:
echo    w   open in a web browser  [recommended on Windows]
echo    Scan the QR code with the Expo Go app on your iPhone.
echo iOS simulator is Mac-only and is not used here.
echo.

call npm run mobile
set "EXPO_EXIT=%errorlevel%"

if not "%EXPO_EXIT%"=="0" (
  echo.
  echo [WARN] Expo exited with code %EXPO_EXIT%. Scroll up to see why.
)

:wait_and_exit
echo.
echo ==============================================
echo Press any key to close this window.
pause >nul
popd 2>nul
endlocal
exit /b 0
