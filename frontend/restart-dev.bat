@echo off
echo 🔄 Restarting E-commerce Development Server...
echo.

REM Kill any existing Vite processes
echo 📱 Stopping existing Vite processes...
taskkill /f /im node.exe 2>nul

REM Clear npm cache
echo 🧹 Clearing npm cache...
npm cache clean --force

REM Remove node_modules and reinstall
echo 📦 Removing node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📥 Reinstalling dependencies...
npm install

REM Clear browser cache instructions
echo.
echo 🌐 Browser Cache Instructions:
echo 1. Open your browser's Developer Tools (F12)
echo 2. Right-click the refresh button
echo 3. Select 'Empty Cache and Hard Reload'
echo 4. Or use Ctrl+Shift+R
echo.

REM Start the development server
echo 🚀 Starting development server...
npm run dev

pause
