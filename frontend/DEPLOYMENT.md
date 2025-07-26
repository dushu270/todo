# 🚀 Deployment Guide

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com) and sign up
- Connect your GitHub account

### 2. Deploy Backend
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `todo-main` repository

2. **Configure Service**
   - **Name**: `todo-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://admin:Test%40123@cluster0.abc123.mongodb.net/todoapp?retryWrites=true&w=majority
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-app-name.onrender.com`

## Frontend Deployment (AWS Amplify)

### 1. Update API Configuration
Update `src/services/api.js` with your Render backend URL:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com/api'
  : 'http://localhost:4000/api';
```

### 2. Deploy to Amplify
1. **Push Changes to GitHub**
   ```bash
   git add .
   git commit -m "Updated backend integration and deployment config"
   git push origin main
   ```

2. **Amplify Auto-Deploy**
   - Your Amplify app will automatically detect the changes
   - It will rebuild and deploy the new version
   - Check the Amplify console for deployment status

### 3. Environment Variables (if needed)
If you need environment variables in Amplify:
- Go to Amplify Console → Your App → Environment Variables
- Add any required variables

## Testing Deployment

1. **Backend Health Check**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status": "OK", "timestamp": "..."}`

2. **Frontend Testing**
   - Visit: `https://main.d2srwj9mjvfxk8.amplifyapp.com`
   - Test login, create namespaces, create tasks
   - Check browser console for any errors

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure backend CORS is configured for your Amplify domain
2. **Environment Variables**: Double-check all env vars are set correctly
3. **MongoDB Connection**: Ensure MongoDB Atlas allows connections from Render IPs
4. **Firebase Config**: Verify Firebase credentials are correct

### Logs:
- **Render**: Check logs in Render dashboard
- **Amplify**: Check build logs in Amplify console
- **Browser**: Check Network tab and Console for frontend errors 