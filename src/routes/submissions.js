const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// API endpoint for data submission
router.post('/submit-data', async (req, res) => {
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
router.get('/', async (req, res) => {
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
router.get('/statistics', async (req, res) => {
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
router.get('/export-csv', async (req, res) => {
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
router.get('/region/:region', async (req, res) => {
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

module.exports = router;
