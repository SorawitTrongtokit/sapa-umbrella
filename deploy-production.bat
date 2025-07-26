@echo off
echo 🚀 Deploying to Firebase Production...

REM Copy production environment variables
copy .env.production .env

REM Clean build directory
if exist dist rmdir /s /q dist

REM Build for production
echo 📦 Building for production...
npm run build

REM Check if build succeeded
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

REM Deploy to Firebase
echo 🔥 Deploying to Firebase...
firebase deploy

REM Restore original .env if it exists
if exist .env.backup copy .env.backup .env

echo ✅ Deployment completed!
pause
