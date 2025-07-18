const mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    interval: {
        type: Number,
        default: 5,
        min: 1
    },
    status: {
        type: String,
        enum: ['up', 'down', 'paused'],
        default: 'paused'
    },
    lastChecked: {
        type: Date
    },
    notificationChannels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NotificationChannel'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Monitor', MonitorSchema);