@echo off
REM FluentAR Web Launcher - double-click and the app opens in your browser.
REM Use start.bat instead if you want to scan from the iPhone (Expo Go / iOS).

setlocal enabledelayedexpansion

pushd "%~dp0" 1>nul 2>nul
if errorlevel 1 (
  echo [ERROR] Could not change to script directory: %~dp0
  goto :wait_and_exit
)

echo ==============================================
echo   FluentAR - web launcher (no QR needed)
echo ==============================================
echo.

REM --- Node check ----------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on PATH.
  echo         Install the LTS from https://nodejs.org then re-run this script.
  goto :wait_and_exit
)

REM --- First-run install ---------------------------------------------------
if not exist "node_modules" (
  echo First-time setup: running npm install --legacy-peer-deps. ^(2-5 minutes^)
  echo.
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. See log above.
    goto :wait_and_exit
  )
  echo.
)

REM --- Launch Expo web -----------------------------------------------------
REM "expo start --web" auto-opens the default browser at localhost:8081.
echo Launching the app in your default browser. Close this window to stop.
echo If the browser does not open, visit  http://localhost:8081  manually.
echo.

call npm run web --workspace=mobile
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
