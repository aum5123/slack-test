# Deployment Guide

## 🚀 Frontend Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set build settings:
     - Framework Preset: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     ```
     REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
     REACT_APP_WS_URL=wss://your-railway-backend-url.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## 🚂 Backend Deployment to Railway

### Prerequisites
- Railway account
- GitHub repository

### Steps

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Dockerfile

2. **Set Environment Variables in Railway**
   - Go to Project Settings → Variables
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=3001
     MAX_MESSAGES=50
     JWT_SECRET=your-production-secret-key
     CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
     ```

3. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

## 🔄 Update Frontend with Backend URL

After Railway deployment:

1. **Get Railway URL**
   - Copy the Railway deployment URL
   - Example: `https://slack-lite-backend-production.railway.app`

2. **Update Vercel Environment Variables**
   - Go to Vercel Project Settings → Environment Variables
   - Update:
     ```
     REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
     REACT_APP_WS_URL=wss://your-railway-backend-url.railway.app
     ```

3. **Redeploy Frontend**
   - Trigger a new deployment in Vercel
   - Or push a new commit to trigger auto-deployment

## 🧪 Testing Deployment

1. **Test Backend**
   ```bash
   curl https://your-railway-backend-url.railway.app/health
   curl https://your-railway-backend-url.railway.app/metrics
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Test login, channel creation, and messaging

## 📝 Production Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured for production domains
- [ ] HTTPS/WSS working for WebSocket
- [ ] Health checks passing
- [ ] Test real-time messaging

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS_ORIGIN is set to your Vercel domain
   - Check that both HTTP and HTTPS are handled

2. **WebSocket Connection Failed**
   - Ensure WS_URL uses `wss://` for production
   - Check Railway WebSocket support

3. **Environment Variables Not Loading**
   - Restart Railway service after adding variables
   - Redeploy Vercel after updating variables

### Useful Commands

```bash
# Check Railway logs
railway logs

# Check Vercel deployment status
vercel ls

# Test local production build
cd frontend && npm run build && npx serve -s build
```
