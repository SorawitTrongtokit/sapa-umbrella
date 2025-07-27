@echo off
REM 🚀 Firebase Free Tier Deployment Script for Windows
REM สำหรับ PCSHSPL Umbrella System

echo 🚀 Starting deployment for Firebase Free Tier...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Check if logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Firebase. Please run:
    echo firebase login
    exit /b 1
)

REM Step 1: Clean up
echo 🧹 Cleaning up previous builds...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
npm ci
if errorlevel 1 (
    echo ❌ Dependencies installation failed.
    exit /b 1
)

REM Step 3: Run tests
echo 🧪 Running tests...
npm run test:run
if errorlevel 1 (
    echo ❌ Tests failed. Deployment aborted.
    exit /b 1
)

REM Step 4: Lint code
echo 🔍 Linting code...
npm run lint
if errorlevel 1 (
    echo ❌ Linting failed. Deployment aborted.
    exit /b 1
)

REM Step 5: Build for production
echo 📦 Building for production...
copy .env.production .env
npm run build:prod
if errorlevel 1 (
    echo ❌ Build failed. Deployment aborted.
    exit /b 1
)

REM Step 6: Check bundle size
echo 📊 Checking bundle size...
npm run size-check
if errorlevel 1 (
    echo ⚠️ Bundle size check failed, but continuing...
)

REM Step 7: Deploy to Firebase
echo 🔥 Deploying to Firebase...
firebase deploy --only hosting
if errorlevel 1 (
    echo ❌ Deployment failed. Please check the errors above.
    exit /b 1
) else (
    echo ✅ Deployment successful!
    
    REM Step 8: Show deployment info
    for /f "tokens=2 delims==" %%a in ('findstr VITE_FIREBASE_PROJECT_ID .env.production') do set PROJECT_ID=%%a
    set SITE_URL=https://%PROJECT_ID%.web.app
    
    echo.
    echo 🎉 Deployment completed successfully!
    echo 🌐 Your app is live at: %SITE_URL%
    echo.
    echo 📊 Next steps:
    echo 1. Test all features on the live site
    echo 2. Monitor Firebase console for usage
    echo 3. Check performance with Lighthouse
    echo.
)

REM Restore original .env
if exist .env.backup copy .env.backup .env

pause
