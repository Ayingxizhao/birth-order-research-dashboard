const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for production, you'd use a proper static file server)
app.use(express.static(path.join(__dirname)));

// In-memory storage (replace with database in production)
let submissions = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for data submission
app.post('/api/submit-data', (req, res) => {
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

        // Add timestamp and ID
        const submission = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...data
        };

        // Store submission (in production, save to database)
        submissions.push(submission);

        // Log submission (in production, this would be more sophisticated)
        console.log('New data submission:', submission);

        res.json({
            success: true,
            message: 'Data submitted successfully',
            submissionId: submission.id
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get all submissions (for research purposes)
app.get('/api/submissions', (req, res) => {
    try {
        // In production, add authentication/authorization here
        res.json({
            success: true,
            count: submissions.length,
            submissions: submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get submission statistics
app.get('/api/statistics', (req, res) => {
    try {
        if (submissions.length === 0) {
            return res.json({
                success: true,
                message: 'No submissions yet',
                statistics: {}
            });
        }

        const stats = {
            totalSubmissions: submissions.length,
            regions: {},
            averageFamilySize: 0,
            genderDistribution: { male: 0, female: 0 },
            averageAttitudeScore: 0,
            averageEducationDifference: 0
        };

        let totalFamilySize = 0;
        let totalAttitudeScore = 0;
        let totalEducationDifference = 0;

        submissions.forEach(sub => {
            // Count regions
            stats.regions[sub.region] = (stats.regions[sub.region] || 0) + 1;
            
            // Sum family sizes
            totalFamilySize += parseInt(sub['family-size']);
            
            // Count genders
            stats.genderDistribution[sub['firstborn-gender']]++;
            
            // Sum attitude scores
            totalAttitudeScore += parseFloat(sub['attitude-score']);
            
            // Calculate education difference
            const diff = parseFloat(sub['firstborn-education']) - parseFloat(sub['laterborn-education']);
            totalEducationDifference += diff;
        });

        // Calculate averages
        stats.averageFamilySize = (totalFamilySize / submissions.length).toFixed(2);
        stats.averageAttitudeScore = (totalAttitudeScore / submissions.length).toFixed(3);
        stats.averageEducationDifference = (totalEducationDifference / submissions.length).toFixed(2);

        res.json({
            success: true,
            statistics: stats
        });

    } catch (error) {
        console.error('Error calculating statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Dashboard available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});

module.exports = app;
