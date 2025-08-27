# Deployment Guide

This guide covers deploying your Birth Order Research Dashboard to different platforms.

## 🚀 GitHub Pages Deployment (Frontend Only)

GitHub Pages is perfect for hosting the static frontend of your dashboard.

### Prerequisites
- GitHub account
- Repository with your code
- GitHub Actions enabled

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Setup project structure and prepare for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy when you push to main/master

3. **Build and Deploy Locally** (optional)
   ```bash
   npm run build
   npm run deploy
   ```

4. **Access Your Dashboard**
   - Your dashboard will be available at: `https://yourusername.github.io/your-repo-name/`
   - The first deployment may take a few minutes

### What Gets Deployed
- ✅ HTML, CSS, JavaScript files
- ✅ Static assets (images, data files)
- ✅ Interactive visualizations
- ❌ Backend API (Node.js/Express)
- ❌ Database (MongoDB)

## 🌐 Full Stack Deployment (Frontend + Backend)

For the complete application with API functionality, consider these platforms:

### Option 1: Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login and deploy
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
git push heroku main
```

### Option 2: Railway
- Connect your GitHub repo
- Add environment variables
- Automatic deployment on push

### Option 3: Render
- Free tier available
- Easy GitHub integration
- MongoDB Atlas connection

## 🗄️ Database Setup for Production

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Add to environment variables

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/birth-order-research
```

## 📱 Frontend-Only Deployment Benefits

**Advantages:**
- ✅ Free hosting on GitHub Pages
- ✅ Automatic deployment on code changes
- ✅ Fast global CDN
- ✅ No server maintenance

**Limitations:**
- ❌ No data submission functionality
- ❌ No real-time statistics
- ❌ No CSV export
- ❌ No user data storage

## 🔄 Hybrid Approach

You can deploy both:
1. **Frontend**: GitHub Pages (free, fast)
2. **Backend**: Heroku/Railway/Render (paid, functional)

Then update your frontend to call the deployed backend API instead of localhost.

## 🚨 Important Notes

- GitHub Pages only supports static files
- Your current backend requires a Node.js environment
- Consider using a headless CMS for data if going frontend-only
- For full functionality, deploy backend to a cloud platform

## 📚 Additional Resources

- [GitHub Pages Documentation](https://pages.github.com/)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Heroku Deployment](https://devcenter.heroku.com/categories/nodejs-support)
