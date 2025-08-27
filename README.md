# Birth Order Research Dashboard

Interactive research dashboard for birth order and cultural gender attitudes research.

## 🏗️ Project Structure

```
src/
├── client/                 # Frontend files
│   ├── components/         # React/Vue components (if applicable)
│   ├── data/              # Static data files
│   ├── styles/            # CSS stylesheets
│   ├── utils/             # Frontend utility functions
│   └── index.html         # Main HTML file
├── server/                 # Backend server
│   └── app.js             # Main server application
├── models/                 # Database models
│   └── Submission.js      # Submission data model
├── routes/                 # API route handlers
│   ├── submissions.js     # Submission-related endpoints
│   └── health.js          # Health check endpoint
├── config/                 # Configuration files
│   └── database.js        # Database connection setup
└── middleware/             # Express middleware (if needed)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>= 14.0.0)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd birth-order-research-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your MongoDB connection string:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/birth-order-research
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Dashboard: http://localhost:3000
   - API: http://localhost:3000/api
   - Health check: http://localhost:3000/api/health

## 🗄️ MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `birth-order-research`

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file with Atlas URI

### Database Schema
The application uses a `Submission` model with the following fields:
- `region`: Cultural region (enum)
- `familySize`: Number of family members
- `firstbornGender`: Gender of firstborn
- `attitudeScore`: Cultural attitude score
- `firstbornEducation`: Education level of firstborn
- `laterbornEducation`: Education level of laterborn
- `ageRange`: Age range of participant
- `notes`: Additional notes
- `contactEmail`: Contact email
- `timestamp`: Submission timestamp

## 📡 API Endpoints

### Submissions
- `POST /api/submissions/submit-data` - Submit new data
- `GET /api/submissions` - Get all submissions (paginated)
- `GET /api/submissions/statistics` - Get submission statistics
- `GET /api/submissions/export-csv` - Export data as CSV
- `GET /api/submissions/region/:region` - Get submissions by region

### Health
- `GET /api/health` - Health check and database status

## 🔧 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📝 License

MIT License - see LICENSE file for details.

