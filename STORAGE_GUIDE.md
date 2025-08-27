# Data Storage Guide for Research Dashboard

This guide explains how the backend works and the different options for storing research submissions.

## 🔧 **How the Backend Currently Works**

### **Current Setup (In-Memory Storage)**
- **File**: `server.js`
- **Storage**: JavaScript array in memory
- **Data Persistence**: ❌ **None** - data is lost when server restarts
- **Use Case**: Development/testing only

### **Data Flow**
1. User fills out form on dashboard
2. Form submits to `/api/submit-data` endpoint
3. Server validates data and stores in memory
4. Server returns success/error response
5. Data is available via `/api/submissions` endpoint

## 🗄️ **Storage Options for Production**

### **Option 1: SQLite Database (Recommended for Start)**
**File**: `server-sqlite.js`

**Pros:**
- ✅ **Persistent storage** - data survives server restarts
- ✅ **No external dependencies** - single file database
- ✅ **ACID compliance** - reliable transactions
- ✅ **Easy backup** - just copy the .db file
- ✅ **Good performance** for small to medium datasets

**Cons:**
- ❌ **Limited scalability** - not suitable for high concurrent users
- ❌ **Single-writer** - only one process can write at a time

**Setup:**
```bash
npm install sqlite3
node server-sqlite.js
```

**Database File**: `submissions.db` (created automatically)

---

### **Option 2: MongoDB (Recommended for Scale)**
**File**: `server-mongodb.js`

**Pros:**
- ✅ **Highly scalable** - handles millions of submissions
- ✅ **Flexible schema** - easy to add new fields
- ✅ **Multiple writers** - concurrent submissions supported
- ✅ **Rich queries** - powerful aggregation pipeline
- ✅ **Cloud hosting** - MongoDB Atlas, Railway, etc.

**Cons:**
- ❌ **External dependency** - requires MongoDB installation
- ❌ **More complex setup** - needs database server
- ❌ **Resource usage** - more memory/CPU than SQLite

**Setup:**
```bash
npm install mongoose
# Install MongoDB locally or use cloud service
node server-mongodb.js
```

---

### **Option 3: PostgreSQL (Enterprise Grade)**
**File**: `server-postgresql.js` (not created yet)

**Pros:**
- ✅ **Enterprise features** - advanced SQL, transactions, constraints
- ✅ **Excellent performance** - optimized for complex queries
- ✅ **Data integrity** - strong validation and constraints
- ✅ **Mature ecosystem** - extensive tooling and support

**Cons:**
- ❌ **Complex setup** - requires database server and configuration
- ❌ **Overkill** for simple research projects
- ❌ **Resource intensive** - needs dedicated server

---

### **Option 4: Cloud Services (No Server Management)**
**File**: `server-cloud.js` (not created yet)

**Services:**
- **Firebase Firestore** - Google's NoSQL database
- **Supabase** - Open-source Firebase alternative
- **PlanetScale** - Serverless MySQL platform
- **Neon** - Serverless PostgreSQL

**Pros:**
- ✅ **No server management** - fully managed by provider
- ✅ **Automatic scaling** - handles traffic spikes
- ✅ **Built-in security** - authentication, authorization
- ✅ **Easy deployment** - connects to your frontend

**Cons:**
- ❌ **Cost** - pay per usage (can add up)
- ❌ **Vendor lock-in** - harder to migrate away
- ❌ **Limited control** - dependent on provider features

## 🚀 **Quick Start with SQLite**

### **1. Install Dependencies**
```bash
npm install sqlite3
```

### **2. Run the Server**
```bash
node server-sqlite.js
```

### **3. Test the API**
```bash
# Submit data
curl -X POST http://localhost:3000/api/submit-data \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Canadian",
    "family-size": 3,
    "firstborn-gender": "male",
    "attitude-score": 0.15,
    "firstborn-education": 16.5,
    "laterborn-education": 15.0,
    "age-range": "26-30"
  }'

# Get all submissions
curl http://localhost:3000/api/submissions

# Get statistics
curl http://localhost:3000/api/statistics

# Export as CSV
curl http://localhost:3000/api/export-csv > submissions.csv
```

## 🔐 **Security Considerations**

### **Data Protection**
- **Input Validation**: All fields are validated before storage
- **SQL Injection Protection**: Parameterized queries prevent attacks
- **Data Sanitization**: HTML/script tags are stripped
- **Rate Limiting**: Prevent spam submissions (add with `express-rate-limit`)

### **Privacy Features**
- **IP Logging**: Track submission sources (optional)
- **User Agent Logging**: Browser/device information
- **Timestamp Tracking**: When data was submitted
- **Contact Email**: Optional follow-up communication

### **Access Control**
- **Public Submission**: Anyone can submit data
- **Protected Access**: Admin endpoints for viewing data
- **API Keys**: Add authentication for sensitive operations

## 📊 **Data Management Features**

### **Built-in Endpoints**
- `POST /api/submit-data` - Submit new research data
- `GET /api/submissions` - View all submissions
- `GET /api/statistics` - Get aggregated statistics
- `GET /api/export-csv` - Download data as CSV
- `GET /api/health` - Check server status

### **Data Export Options**
- **CSV Export**: Download all data for analysis
- **JSON API**: Programmatic access to data
- **Statistics API**: Pre-calculated metrics
- **Regional Analysis**: Data grouped by region

### **Data Validation**
- **Required Fields**: All essential data must be provided
- **Value Ranges**: Numbers within reasonable bounds
- **Enum Values**: Predefined options for categorical data
- **Email Format**: Valid email addresses for contact info

## 🌐 **Deployment Options**

### **Local Development**
```bash
npm install
node server-sqlite.js
# Dashboard available at http://localhost:3000
```

### **Heroku Deployment**
```bash
# Add to package.json
"engines": { "node": "18.x" }

# Deploy
heroku create your-app-name
git push heroku main
```

### **Railway Deployment**
1. Connect GitHub repository
2. Railway automatically detects Node.js
3. Deploys on every push

### **Vercel/Netlify**
- Convert Express routes to serverless functions
- Use their database services (Vercel Postgres, etc.)

## 📈 **Scaling Considerations**

### **Small Research Project (< 1000 submissions)**
- **SQLite** - Perfect choice
- **Single server** - Simple deployment
- **File backup** - Regular database file backups

### **Medium Research Project (1000-100,000 submissions)**
- **MongoDB** - Better performance and scalability
- **Cloud hosting** - Railway, Render, or similar
- **Regular backups** - Automated database backups

### **Large Research Project (100,000+ submissions)**
- **PostgreSQL** - Enterprise-grade performance
- **Load balancing** - Multiple server instances
- **CDN** - Content delivery network for static files
- **Monitoring** - Application performance monitoring

## 🔄 **Migration Between Storage Options**

### **SQLite → MongoDB**
1. Export data from SQLite
2. Import into MongoDB
3. Update server code
4. Test thoroughly
5. Deploy new version

### **MongoDB → PostgreSQL**
1. Export MongoDB collections
2. Transform data to SQL format
3. Import into PostgreSQL
4. Update server code
5. Deploy new version

## 💡 **Best Practices**

### **Data Backup**
- **Regular backups** - Daily/weekly depending on activity
- **Multiple locations** - Local + cloud storage
- **Version control** - Track schema changes
- **Test restores** - Verify backup integrity

### **Performance Optimization**
- **Database indexes** - Speed up common queries
- **Connection pooling** - Reuse database connections
- **Caching** - Cache frequently accessed data
- **Query optimization** - Use efficient database queries

### **Monitoring**
- **Health checks** - Regular API endpoint monitoring
- **Error logging** - Track and fix issues
- **Performance metrics** - Response times, throughput
- **User analytics** - Submission patterns, popular regions

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Database connection errors** - Check database service status
2. **Validation errors** - Verify form data format
3. **Performance issues** - Add database indexes
4. **Memory leaks** - Monitor server memory usage

### **Debug Mode**
```javascript
// Enable detailed logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('Debug mode enabled');
}
```

---

## 🎯 **Recommendation**

**For your research dashboard, I recommend starting with SQLite:**

1. **Start Simple**: Use `server-sqlite.js` for immediate data persistence
2. **Test Thoroughly**: Ensure all features work with real data
3. **Monitor Growth**: Track submission volume and performance
4. **Scale When Needed**: Migrate to MongoDB when you reach 1000+ submissions

**SQLite gives you:**
- ✅ Persistent storage (no more lost data!)
- ✅ Professional-grade reliability
- ✅ Easy backup and migration
- ✅ No external dependencies
- ✅ Perfect for research projects

Would you like me to help you set up the SQLite version or explain any specific part in more detail?
