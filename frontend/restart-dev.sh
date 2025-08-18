#!/bin/bash

echo "🔄 Restarting E-commerce Development Server..."
echo ""

# Kill any existing Vite processes
echo "📱 Stopping existing Vite processes..."
pkill -f "vite" || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Remove node_modules and reinstall
echo "📦 Removing node_modules..."
rm -rf node_modules
rm -rf package-lock.json

echo "📥 Reinstalling dependencies..."
npm install

# Clear browser cache instructions
echo ""
echo "🌐 Browser Cache Instructions:"
echo "1. Open your browser's Developer Tools (F12)"
echo "2. Right-click the refresh button"
echo "3. Select 'Empty Cache and Hard Reload'"
echo "4. Or use Ctrl+Shift+R (Cmd+Shift+R on Mac)"
echo ""

# Start the development server
echo "🚀 Starting development server..."
npm run dev
