# 🚀 GitHub Setup & Deployment Guide

## Quick Start - Push to GitHub

### Option 1: Single Monorepo (Easier for small teams)

```powershell
# Step 1: Create repository on GitHub
# Go to https://github.com/new
# Repository name: greenway-ai
# Description: GreenWay AI - Smart Sustainable Tourism Management Platform
# Public: Yes
# Initialize with: No (don't initialize)

# Step 2: Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/greenway-ai.git
git branch -M main
git push -u origin main
```

---

### Option 2: Separate Repositories (Recommended for production)

#### **Repository 1: Frontend (Vercel)**

```powershell
# Create frontend folder structure
mkdir greenway-ai-frontend
cd greenway-ai-frontend

# Initialize git
git init
git config user.name "GreenWay AI"
git config user.email "dev@greenway-ai.com"

# Copy frontend files (from original project)
Copy-Item -Path "..\green-way-ai\src" -Destination "src" -Recurse
Copy-Item -Path "..\green-way-ai\public" -Destination "public" -Recurse
Copy-Item -Path "..\green-way-ai\index.html"
Copy-Item -Path "..\green-way-ai\package.json"
Copy-Item -Path "..\green-way-ai\package-lock.json"
Copy-Item -Path "..\green-way-ai\vite.config.ts"
Copy-Item -Path "..\green-way-ai\tsconfig.json"
Copy-Item -Path "..\green-way-ai\tsconfig.app.json"
Copy-Item -Path "..\green-way-ai\tsconfig.node.json"
Copy-Item -Path "..\green-way-ai\tailwind.config.ts"
Copy-Item -Path "..\green-way-ai\postcss.config.js"
Copy-Item -Path "..\green-way-ai\eslint.config.js"
Copy-Item -Path "..\green-way-ai\components.json"
Copy-Item -Path "..\green-way-ai\vercel.json"
Copy-Item -Path "..\green-way-ai\.env.example"
Copy-Item -Path "..\green-way-ai\.gitignore"
Copy-Item -Path "..\green-way-ai\README.md"

# Create .gitignore (sensitive for frontend)
'
node_modules
dist
.env
.env.local
.env.*.local
.vscode
.idea
*.swp
.DS_Store
*.log
' | Out-File -FilePath ".gitignore" -Encoding utf8

# Push to GitHub
git add .
git commit -m "Initial commit: GreenWay AI Frontend - React + Vite + Tailwind"
git remote add origin https://github.com/YOUR_USERNAME/greenway-ai-frontend.git
git branch -M main
git push -u origin main

cd ..
```

#### **Repository 2: Backend (Render)**

```powershell
# Create backend folder structure
mkdir greenway-ai-backend
cd greenway-ai-backend

# Initialize git
git init
git config user.name "GreenWay AI"
git config user.email "dev@greenway-ai.com"

# Copy backend files
Copy-Item -Path "..\green-way-ai\backend" -Destination "backend" -Recurse
Copy-Item -Path "..\green-way-ai\render.yaml"
Copy-Item -Path "..\green-way-ai\.env.example"
Copy-Item -Path "..\green-way-ai\README.md"
Copy-Item -Path "..\green-way-ai\start-backend.ps1"
Copy-Item -Path "..\green-way-ai\setup-backend.ps1"

# Create backend-specific .gitignore
'
venv/
__pycache__
*.py[cod]
*.so
.env
.env.local
.vscode
.idea
.DS_Store
*.log
*.pkl
*.joblib
.pytest_cache
' | Out-File -FilePath ".gitignore" -Encoding utf8

# Create requirements.txt (if not exists)
Copy-Item -Path "..\green-way-ai\backend\requirements.txt"

# Create backend README
'
# GreenWay AI Backend API

## Setup

\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python backend/api/app.py
\`\`\`

## API Endpoints

- GET `/api/health` - Health check
- GET `/api/kpis` - Dashboard metrics
- GET `/api/congestion/weekly` - 7-day predictions
- GET `/api/clustering/segments` - Tourist segments
- GET `/api/esi/current` - ESI score
- GET `/api/recommendations` - Smart suggestions

## Deployment

See root DEPLOYMENT.md for Render setup instructions.
' | Out-File -FilePath "BACKEND.md" -Encoding utf8

# Push to GitHub
git add .
git commit -m "Initial commit: GreenWay AI Backend - Flask API with ML Models"
git remote add origin https://github.com/YOUR_USERNAME/greenway-ai-backend.git
git branch -M main
git push -u origin main

cd ..
```

---

## ✅ Verification Checklist

After pushing:

- [ ] GitHub repository created
- [ ] All files pushed (check on github.com)
- [ ] No `.env` files exposed
- [ ] No `node_modules` or `venv` folders in repo
- [ ] `.gitignore` working properly
- [ ] README visible on GitHub
- [ ] DEPLOYMENT.md exists

---

## 🔐 Security Check

Verify no sensitive data is exposed:

```powershell
# Check for environment files
git log --diff-filter=D --summary | grep .env

# Show all files in repo (GitHub web shows this)
# Go to https://github.com/YOUR_USERNAME/greenway-ai

# Look for sensitive files:
# - .env files ❌
# - API keys ❌
# - Database credentials ❌
# - node_modules ❌
# - venv ❌
```

---

## 🚀 Next Steps: Deploy

Once pushed to GitHub:

### Deploy Backend to Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select `greenway-ai-backend` repo
5. Configure:
   - **Name**: `greenway-ai-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/api/app.py`
6. Add environment variables (from .env.example)
7. Deploy (free tier available)

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select `greenway-ai-frontend` repo
5. Vercel auto-detects Vite config
6. Add environment variables:
   - `VITE_API_URL=https://your-render-backend-url`
   - `VITE_SUPABASE_URL=your_url`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=your_key`
7. Deploy (auto-deploys on push)

---

## 📝 Common Commands

```powershell
# Check what will be pushed
git status

# View recent commits
git log --oneline

# See files in staging
git diff --cached

# Unstage file (don't push)
git reset HEAD filename

# Revert last commit (if something wrong was pushed)
git revert HEAD
```

---

## 🆘 Troubleshooting

**"Permission denied (publickey)"**
- Generate SSH key: `ssh-keygen -t ed25519`
- Add to GitHub: Settings → SSH Keys

**"Large files rejected"**
- Check for `node_modules`, `venv`, `dist` folders
- These should be in `.gitignore`
- Delete from git: `git rm --cached folder_name -r`

**"fatal: remote origin already exists"**
- Remove old remote: `git remote remove origin`
- Add new: `git remote add origin https://...`

---

## 📚 Documentation

- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

---

**Project Status**: ✅ Ready to deploy!
