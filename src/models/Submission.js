const mongoose = require('mongoose');

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

module.exports = mongoose.model('Submission', submissionSchema);
