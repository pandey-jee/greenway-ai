# 🚀 Deployment Guide

## GreenWay AI - Vercel (Frontend) & Render (Backend)

This project is configured for deployment to **Vercel** (Frontend) and **Render** (Backend).

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier: vercel.com)
- Render account (free tier: render.com)
- Git installed

---

## 🔧 Setup Instructions

### **Option 1: Single Monorepo (Recommended for simplicity)**

#### Step 1: Initialize Git & Push to GitHub
```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: GreenWay AI - Tourism Management Platform"

# Create repository on GitHub
# Go to github.com/new and create: greenway-ai (keep it public)

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/greenway-ai.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Backend to Render

1. Go to **render.com** → Sign in/Sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `greenway-ai-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/api/app.py`
5. Add Environment Variables:
   ```
   FLASK_ENV=production
   CORS_ORIGINS=https://your-vercel-domain.vercel.app
   PYTHONUNBUFFERED=true
   ```
6. Click **"Create Web Service"**
7. Copy the deployed URL (e.g., `https://greenway-ai-backend.onrender.com`)

#### Step 3: Deploy Frontend to Vercel

1. Go to **vercel.com** → Sign in/Sign up
2. Click **"Add New"** → **"Project"**
3. Import GitHub repository (`greenway-ai`)
4. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://greenway-ai-backend.onrender.com
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```
6. Click **"Deploy"**
7. Get your Vercel URL (e.g., `https://greenway-ai.vercel.app`)

#### Step 4: Update Backend CORS

Update `backend/api/app.py` CORS settings with your Vercel URL:
```python
cors_origins = os.getenv('CORS_ORIGINS', 'https://greenway-ai.vercel.app').split(',')
```

---

### **Option 2: Separate Repositories (Recommended for team)**

#### Step 1: Create Frontend Repo

```powershell
# Create frontend-only repo on GitHub: greenway-ai-frontend

git clone https://github.com/YOUR_USERNAME/greenway-ai-frontend.git
cd greenway-ai-frontend

# Copy frontend files
Copy-Item -Path "C:\Development\green-way-ai\*" -Exclude @("backend", ".git") -Recurse

git add .
git commit -m "Initial commit: GreenWay AI Frontend"
git push -u origin main
```

#### Step 2: Create Backend Repo

```powershell
# Create backend-only repo on GitHub: greenway-ai-backend

git clone https://github.com/YOUR_USERNAME/greenway-ai-backend.git
cd greenway-ai-backend

# Copy only backend files
mkdir backend
Copy-Item -Path "C:\Development\green-way-ai\backend\*" -Recurse

# Copy requirements and scripts
Copy-Item -Path "C:\Development\green-way-ai\backend\requirements.txt"
Copy-Item -Path "C:\Development\green-way-ai\render.yaml"
Copy-Item -Path "C:\Development\green-way-ai\.env.example"

git add .
git commit -m "Initial commit: GreenWay AI Backend API"
git push -u origin main
```

#### Step 3: Deploy Each Service
- Deploy backend repo to **Render**
- Deploy frontend repo to **Vercel**

---

## 🔐 Environment Variables

### **Frontend (.env.local in Vercel)**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_public_key
```

### **Backend (.env in Render)**
```
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app
PYTHONUNBUFFERED=true
```

---

## ✅ Verification

### Test Backend Health
```
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{"status": "ok"}
```

### Test Frontend
Open `https://your-frontend.vercel.app` in browser

---

## 🔄 CI/CD Pipeline (Auto Deploy)

Both platforms support automatic deployments:

**Vercel**: Auto-deploys on push to `main`
**Render**: Auto-deploys on repository changes

To disable/configure:
- Vercel: Settings → Git → Auto-deploy
- Render: Environment → Auto-deploy settings

---

## 🛠️ Troubleshooting

### Backend Deploy Issues
- Check logs: Render Dashboard → Service → Logs
- Ensure Python 3.8+ is set
- Verify `requirements.txt` exists
- Check CORS origins in environment variables

### Frontend Deploy Issues
- Check logs: Vercel Dashboard → Deployments
- Ensure build command is correct
- Verify environment variables are set
- Clear Vercel cache and redeploy

### CORS Errors
If frontend shows CORS errors:
1. Update backend CORS_ORIGINS with correct Vercel URL
2. Redeploy backend
3. Clear frontend cache
4. Test with API URL in browser console

---

## 📱 Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS properly set
- [ ] API endpoints tested
- [ ] Database/data sources accessible
- [ ] Error monitoring set up
- [ ] Custom domain configured (optional)

---

## 📚 References

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Flask on Render](https://render.com/docs/deploy-flask)
