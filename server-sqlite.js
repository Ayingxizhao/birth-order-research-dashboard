const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./submissions.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables if they don't exist
function createTables() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            region TEXT NOT NULL,
            family_size INTEGER NOT NULL,
            firstborn_gender TEXT NOT NULL,
            attitude_score REAL NOT NULL,
            firstborn_education REAL NOT NULL,
            laterborn_education REAL NOT NULL,
            age_range TEXT NOT NULL,
            notes TEXT,
            contact_email TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Submissions table ready');
        }
    });
}

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

        // Prepare data for database
        const submission = {
            region: data.region,
            family_size: parseInt(data['family-size']),
            firstborn_gender: data['firstborn-gender'],
            attitude_score: parseFloat(data['attitude-score']),
            firstborn_education: parseFloat(data['firstborn-education']),
            laterborn_education: parseFloat(data['laterborn-education']),
            age_range: data['age-range'],
            notes: data.notes || '',
            contact_email: data['contact-email'] || ''
        };

        // Insert into database
        const insertSQL = `
            INSERT INTO submissions 
            (region, family_size, firstborn_gender, attitude_score, firstborn_education, laterborn_education, age_range, notes, contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            submission.region,
            submission.family_size,
            submission.firstborn_gender,
            submission.attitude_score,
            submission.firstborn_education,
            submission.laterborn_education,
            submission.age_range,
            submission.notes,
            submission.contact_email
        ];

        db.run(insertSQL, params, function(err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({
                    success: false,
                    error: 'Database error'
                });
            }

            res.json({
                success: true,
                message: 'Data submitted successfully',
                submissionId: this.lastID
            });
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get all submissions
app.get('/api/submissions', (req, res) => {
    const sql = 'SELECT * FROM submissions ORDER BY timestamp DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Database error'
            });
        }

        res.json({
            success: true,
            count: rows.length,
            submissions: rows
        });
    });
});

// API endpoint to get submission statistics
app.get('/api/statistics', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            AVG(family_size) as avg_family_size,
            AVG(attitude_score) as avg_attitude_score,
            AVG(firstborn_education - laterborn_education) as avg_education_diff,
            region,
            firstborn_gender
        FROM submissions 
        GROUP BY region, firstborn_gender
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Database error'
            });
        }

        if (rows.length === 0) {
            return res.json({
                success: true,
                message: 'No submissions yet',
                statistics: {}
            });
        }

        // Process statistics
        const stats = {
            totalSubmissions: rows.reduce((sum, row) => sum + row.total, 0),
            regions: {},
            averageFamilySize: 0,
            genderDistribution: { male: 0, female: 0 },
            averageAttitudeScore: 0,
            averageEducationDifference: 0
        };

        let totalFamilySize = 0;
        let totalAttitudeScore = 0;
        let totalEducationDifference = 0;
        let totalCount = 0;

        rows.forEach(row => {
            totalCount += row.total;
            totalFamilySize += row.avg_family_size * row.total;
            totalAttitudeScore += row.avg_attitude_score * row.total;
            totalEducationDifference += row.avg_education_diff * row.total;
            
            // Count by region and gender
            if (!stats.regions[row.region]) stats.regions[row.region] = 0;
            stats.regions[row.region] += row.total;
            
            if (row.firstborn_gender === 'male') {
                stats.genderDistribution.male += row.total;
            } else {
                stats.genderDistribution.female += row.total;
            }
        });

        // Calculate averages
        stats.averageFamilySize = (totalFamilySize / totalCount).toFixed(2);
        stats.averageAttitudeScore = (totalAttitudeScore / totalCount).toFixed(3);
        stats.averageEducationDifference = (totalEducationDifference / totalCount).toFixed(2);

        res.json({
            success: true,
            statistics: stats
        });
    });
});

// API endpoint to export data as CSV
app.get('/api/export-csv', (req, res) => {
    const sql = 'SELECT * FROM submissions ORDER BY timestamp DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Database error'
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No data to export'
            });
        }

        // Convert to CSV
        const headers = Object.keys(rows[0]).join(',');
        const csvData = rows.map(row => 
            Object.values(row).map(value => 
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${csvData}`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
        res.send(csv);
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    db.get('SELECT 1', (err) => {
        if (err) {
            return res.json({
                status: 'unhealthy',
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Dashboard available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    console.log(`Database: submissions.db`);
});

module.exports = app;
