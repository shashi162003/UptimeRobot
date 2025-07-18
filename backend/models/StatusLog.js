const mongoose = require('mongoose');

const StatusLogSchema = new mongoose.Schema({
    monitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['up', 'down'],
        required: true
    },
    responseTime: {
        type: Number
    },
    error: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('StatusLog', StatusLogSchema);