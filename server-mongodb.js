const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/birth-order-research';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database');
});

// Define Submission Schema
const submissionSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true,
        enum: ['Canadian', 'Pacific Islander', 'Western European', 'British', 'Central American', 'South American', 'Caribbean', 'Eastern European', 'Northern European', 'East Asian', 'African', 'South Asian', 'Middle Eastern', 'Other']
    },
    familySize: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    firstbornGender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    attitudeScore: {
        type: Number,
        required: true,
        min: 0.1,
        max: 0.7
    },
    firstbornEducation: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    laterbornEducation: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    ageRange: {
        type: String,
        required: true,
        enum: ['18-25', '26-30', '31-35', '35+']
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    contactEmail: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
submissionSchema.index({ region: 1, timestamp: -1 });
submissionSchema.index({ attitudeScore: 1 });
submissionSchema.index({ timestamp: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for data submission
app.post('/api/submit-data', async (req, res) => {
    try {
        const data = req.body;
        
        // Validate required fields
        const requiredFields = ['region', 'family-size', 'firstborn-gender', 'attitude-score', 'firstborn-education', 'laterborn-education', 'age-range'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Create new submission document
        const submission = new Submission({
            region: data.region,
            familySize: parseInt(data['family-size']),
            firstbornGender: data['firstborn-gender'],
            attitudeScore: parseFloat(data['attitude-score']),
            firstbornEducation: parseFloat(data['firstborn-education']),
            laterbornEducation: parseFloat(data['laterborn-education']),
            ageRange: data['age-range'],
            notes: data.notes || '',
            contactEmail: data['contact-email'] || '',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Save to database
        const savedSubmission = await submission.save();
        
        console.log('New data submission:', savedSubmission);

        res.json({
            success: true,
            message: 'Data submitted successfully',
            submissionId: savedSubmission._id
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get all submissions with pagination
app.get('/api/submissions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const submissions = await Submission.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await Submission.countDocuments();

        res.json({
            success: true,
            count: submissions.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            submissions
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// API endpoint to get submission statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await Submission.aggregate([
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    averageFamilySize: { $avg: '$familySize' },
                    averageAttitudeScore: { $avg: '$attitudeScore' },
                    averageEducationDifference: { $avg: { $subtract: ['$firstbornEducation', '$laterbornEducation'] } },
                    regions: { $addToSet: '$region' },
                    genderDistribution: { $addToSet: '$firstbornGender' }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                message: 'No submissions yet',
                statistics: {}
            });
        }

        const result = stats[0];
        
        // Get detailed region counts
        const regionStats = await Submission.aggregate([
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get gender distribution
        const genderStats = await Submission.aggregate([
            { $group: { _id: '$firstbornGender', count: { $sum: 1 } } }
        ]);

        const genderDistribution = {};
        genderStats.forEach(stat => {
            genderDistribution[stat._id] = stat.count;
        });

        const response = {
            success: true,
            statistics: {
                totalSubmissions: result.totalSubmissions,
                averageFamilySize: result.averageFamilySize.toFixed(2),
                averageAttitudeScore: result.averageAttitudeScore.toFixed(3),
                averageEducationDifference: result.averageEducationDifference.toFixed(2),
                regions: regionStats,
                genderDistribution
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error calculating statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// API endpoint to export data as CSV
app.get('/api/export-csv', async (req, res) => {
    try {
        const submissions = await Submission.find()
            .sort({ timestamp: -1 })
            .select('-__v -_id');

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No data to export'
            });
        }

        // Convert to CSV
        const headers = Object.keys(submissions[0]).join(',');
        const csvData = submissions.map(sub => 
            Object.values(sub).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${csvData}`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
        res.send(csv);

    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({
            success: false,
            error: 'Export error'
        });
    }
});

// API endpoint to get submissions by region
app.get('/api/submissions/region/:region', async (req, res) => {
    try {
        const { region } = req.params;
        const submissions = await Submission.find({ region })
            .sort({ timestamp: -1 })
            .select('-__v');

        res.json({
            success: true,
            region,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        console.error('Error fetching regional submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Dashboard available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    console.log(`MongoDB: ${MONGODB_URI}`);
});

module.exports = app;
