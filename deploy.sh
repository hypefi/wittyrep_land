#!/bin/bash

echo "🚀 WittyReply Landing Page Deployment Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the landing-page directory?"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "✅ Build completed! Your site is ready in the 'dist' folder."
echo ""
echo "🌐 Deployment Options:"
echo "1. Cloudflare Pages: Upload the 'dist' folder at https://dash.cloudflare.com/pages"
echo "2. Vercel: Run 'npx vercel' to deploy"
echo "3. Netlify: Drag the 'dist' folder to https://app.netlify.com/drop"
echo ""
echo "🎉 Happy deploying!" 