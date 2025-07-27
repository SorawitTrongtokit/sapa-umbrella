#!/bin/bash

# 🚀 Firebase Free Tier Deployment Script
# สำหรับ PCSHSPL Umbrella System

echo "🚀 Starting deployment for Firebase Free Tier..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Step 1: Clean up
echo "🧹 Cleaning up previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Step 3: Run tests
echo "🧪 Running tests..."
npm run test:run
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Step 4: Lint code
echo "🔍 Linting code..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Deployment aborted."
    exit 1
fi

# Step 5: Build for production
echo "📦 Building for production..."
cp .env.production .env
npm run build:prod
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

# Step 6: Check bundle size
echo "📊 Checking bundle size..."
npm run size-check
if [ $? -ne 0 ]; then
    echo "⚠️ Bundle size check failed, but continuing..."
fi

# Step 7: Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    
    # Step 8: Run post-deployment checks
    echo "🔍 Running post-deployment checks..."
    
    # Check if site is accessible
    PROJECT_ID=$(grep VITE_FIREBASE_PROJECT_ID .env.production | cut -d '=' -f2)
    SITE_URL="https://${PROJECT_ID}.web.app"
    
    echo "🌐 Checking site accessibility: $SITE_URL"
    curl -I "$SITE_URL" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Site is accessible!"
    else
        echo "⚠️ Site might not be accessible yet. Please check manually."
    fi
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your app is live at: $SITE_URL"
    echo ""
    echo "📊 Next steps:"
    echo "1. Test all features on the live site"
    echo "2. Monitor Firebase console for usage"
    echo "3. Check performance with Lighthouse"
    echo ""
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

# Restore original .env
if [ -f .env.backup ]; then
    mv .env.backup .env
fi
