# 🚀 Dark Pool Intel - Render Deployment Guide

## Prerequisites
✅ Render account (free)
✅ GitHub account with your code uploaded
✅ This guide (no coding knowledge required!)

---

## Step 1: Upload Your Code to GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **"New repository"** (green button)
3. Name it: `dark-pool-intel`
4. Make it **Public** (required for free Render)
5. Click **"Create repository"**
6. Upload your project folder to this repository

---

## Step 2: Deploy Backend (API + Database)

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `finra-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 2.2 Add Environment Variables
In your service settings, go to **Environment** tab and add:
```
NODE_ENV=production
PORT=10000
LOG_LEVEL=info
```

### 2.3 Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `finra-postgres`
   - **Database Name**: `finra_data`
   - **User**: `finra_user`
   - **Plan**: `Free`
3. Click **"Create Database"**

### 2.4 Connect Database to Backend
1. Go back to your `finra-backend` service
2. Go to **Environment** tab
3. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Select your `finra-postgres` database from dropdown

---

## Step 3: Deploy Frontend (Website)

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finra-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

### 3.1 Configure Frontend Environment
In your frontend service, go to **Environment** tab and add:
```
VITE_API_URL=https://finra-backend.onrender.com
```
*(Replace with your actual backend URL)*

---

## Step 4: Set Up Cron Jobs (Daily Data Fetching)

1. Click **"New +"** → **"Cron Job"**
2. Configure:
   - **Name**: `daily-finra-fetch`
   - **Command**: `node neon-cron-job.js`
   - **Schedule**: `0 6 * * 1-5` (6 AM weekdays)
   - **Plan**: `Free`
3. Connect to your GitHub repository
4. Set **Root Directory**: `backend`

---

## Step 5: Update CORS Settings

1. Go to your backend service
2. Go to **Environment** tab
3. Add:
```
CORS_ORIGIN=https://your-frontend-url.onrender.com
```
*(Replace with your actual frontend URL)*

---

## Step 6: Test Your Deployment

### ✅ Backend Health Check
Visit: `https://your-backend-url.onrender.com/health`
Should return: `{"status": "OK"}`

### ✅ Frontend Access
Visit: `https://your-frontend-url.onrender.com`
Should load your FINRA tracker website

### ✅ Database Connection
Check your backend logs for successful database connection

---

## 🎉 You're Done!

**Your Dark Pool Intel is now live with:**
- ✅ Always-on backend API
- ✅ Beautiful frontend website
- ✅ Automatic daily data fetching
- ✅ PostgreSQL database
- ✅ All on Render's free tier!

---

## 🆘 Need Help?

**Common Issues:**
1. **Build fails**: Check your `package.json` files are correct
2. **Database connection fails**: Verify `DATABASE_URL` is set correctly
3. **Frontend can't reach backend**: Check `VITE_API_URL` matches your backend URL
4. **Cron job not running**: Verify the schedule format and command path

**Where to get your URLs:**
- Backend URL: In your web service dashboard
- Frontend URL: In your static site dashboard
- Database URL: Auto-generated when you connect it

---

## 💡 Pro Tips

- **Free tier limits**: 750 hours/month (always-on), 100GB bandwidth
- **Logs**: Check service logs if something isn't working
- **Updates**: Push to GitHub to auto-deploy updates
- **Custom domains**: Available on paid plans

**Congratulations! Your Dark Pool Intel project is now deployed professionally! 🎊**