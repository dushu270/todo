#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Deploy: Updated backend integration and production config"
else
    echo "✅ Git is clean, no changes to commit"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render (see DEPLOYMENT.md)"
echo "2. Update API_BASE_URL in src/services/api.js with your Render URL"
echo "3. Push changes again to trigger Amplify rebuild"
echo ""
echo "Your Amplify app: https://main.d2srwj9mjvfxk8.amplifyapp.com" 