# Deployment Guide

This guide explains how to deploy the Birth Order Research Dashboard to GitHub Pages and set up the backend server.

## 🚀 GitHub Pages Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `birth-order-research-dashboard`
3. Make it public (required for GitHub Pages)
4. Don't initialize with README (we already have one)

### 2. Push Your Code

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Birth Order Research Dashboard"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/birth-order-research-dashboard.git

# Push to main branch
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/(root)** folder
6. Click **Save**

Your dashboard will be available at:
`https://YOUR_USERNAME.github.io/birth-order-research-dashboard/`

### 4. Update README Links

After deployment, update the README.md file to replace `yourusername` with your actual GitHub username.

## 🔧 Backend Server Setup

### Option 1: Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. The dashboard will be available at `http://localhost:3000`

### Option 2: Production Deployment

#### Heroku Deployment

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

5. Open your app:
   ```bash
   heroku open
   ```

#### Railway Deployment

1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Deploy automatically on push

#### Render Deployment

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`

### Option 3: Vercel/Netlify (Static + API Routes)

For these platforms, you'll need to convert the Express backend to serverless functions.

## 🔗 Connect Frontend to Backend

### Update the Dashboard

In `index.html`, update the form submission to use your backend URL:

```javascript
// Replace the simulated API call with real backend
fetch('https://your-backend-url.com/api/submit-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {
    if (result.success) {
        showSubmissionStatus('success', result.message);
        event.target.reset();
    } else {
        showSubmissionStatus('error', result.error);
    }
})
.catch(error => {
    showSubmissionStatus('error', 'Network error. Please try again.');
})
.finally(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});
```

### Environment Variables

Create a `.env` file for your backend:

```env
PORT=3000
NODE_ENV=production
# Add database connection strings if using a database
# DATABASE_URL=your_database_url
```

## 🗄️ Database Integration

### Current Setup: In-Memory Storage

The current backend uses in-memory storage. For production, consider:

#### MongoDB
```bash
npm install mongoose
```

#### PostgreSQL
```bash
npm install pg
```

#### SQLite
```bash
npm install sqlite3
```

### Example MongoDB Integration

```javascript
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    region: String,
    familySize: Number,
    firstbornGender: String,
    attitudeScore: Number,
    firstbornEducation: Number,
    laterbornEducation: Number,
    ageRange: String,
    notes: String,
    contactEmail: String,
    timestamp: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', submissionSchema);
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Add input validation and sanitization
- [ ] Implement rate limiting
- [ ] Add CORS restrictions
- [ ] Use environment variables for sensitive data
- [ ] Add authentication for admin endpoints
- [ ] Implement HTTPS
- [ ] Add request logging
- [ ] Set up monitoring and error tracking

### Example Security Middleware

```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(helmet());
```

## 📊 Monitoring and Analytics

### Add Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### Health Checks

The backend includes a health check endpoint at `/api/health` for monitoring.

## 🚀 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS settings match your frontend domain
2. **404 Errors**: Check that your GitHub Pages source is set to the correct branch
3. **API Timeouts**: Consider using a CDN or optimizing your backend response times
4. **Mobile Issues**: Test responsive design on various devices

### Debug Mode

Enable debug logging in your backend:

```javascript
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
```

## 📞 Support

For deployment issues:
1. Check the [GitHub Pages documentation](https://pages.github.com/)
2. Review your platform's deployment logs
3. Test locally before deploying
4. Use browser developer tools to debug frontend issues

---

**Note**: This dashboard is designed to work as a static site on GitHub Pages. The backend server is optional and only needed if you want to collect data submissions.
