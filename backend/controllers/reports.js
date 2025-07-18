const Monitor = require('../models/Monitor');
const StatusLog = require('../models/StatusLog');
const mongoose = require('mongoose');

/**
 * @route   GET /api/v1/reports/monitors/:id/logs
 * @desc    Get paginated historical status logs for a specific monitor
 */

exports.getMonitorLogs = async (req, res) => {
    try {
        const monitorId = req.params.id;

        const monitor = await Monitor.findOne({ _id: monitorId, user: req.user._id });
        if (!monitor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Monitor not found or you are not authorized' 
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const logs = await StatusLog.find({ monitor: monitorId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const totalLogs = await StatusLog.countDocuments({ monitor: monitorId });

        res.status(200).json({
            success: true,
            count: logs.length,
            pagination: {
                totalPages: Math.ceil(totalLogs / limit),
                currentPage: page,
            },
            data: logs
        });

    } catch (error) {
        console.error(`Error getting monitor logs: ${error.message}`.red);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


/**
 * @route   GET /api/v1/reports/monitors/:id/summary
 * @desc    Get a summary report (uptime %, avg response time) for one monitor
 */

exports.getMonitorSummary = async (req, res) => {
    try {
        const monitorId = req.params.id;

        const monitor = await Monitor.findOne({ _id: monitorId, user: req.user._id });
        if (!monitor) {
            return res.status(404).json({ success: false, message: 'Monitor not found or you are not authorized' });
        }

        const summary = await StatusLog.aggregate([
            { $match: { monitor: new mongoose.Types.ObjectId(monitorId) } },
            {
                $group: {
                    _id: '$monitor',
                    totalChecks: { $sum: 1 },
                    upChecks: { $sum: { $cond: [{ $eq: ['$status', 'up'] }, 1, 0] } },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            }
        ]);

        if (summary.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    uptimePercentage: 100,
                    averageResponseTime: 0,
                    totalChecks: 0
                }
            });
        }

        const { totalChecks, upChecks, avgResponseTime } = summary[0];
        const uptimePercentage = (upChecks / totalChecks) * 100;

        res.status(200).json({
            success: true,
            data: {
                uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
                averageResponseTime: Math.round(avgResponseTime),
                totalChecks
            }
        });

    } catch (error) {
        console.error(`Error getting monitor summary: ${error.message}`.red);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @route   GET /api/v1/reports/summary
 * @desc    Get an aggregate summary for ALL monitors belonging to the user
 */

exports.getOverallSummary = async (req, res) => {
    try {
        const userMonitors = await Monitor.find({ user: req.user._id }).select('_id');

        if (userMonitors.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalMonitors: 0,
                    overallUptimePercentage: 100,
                    averageResponseTime: 0,
                    totalChecks: 0,
                }
            });
        }

        const monitorIds = userMonitors.map(m => m._id);

        const summary = await StatusLog.aggregate([
            {
                $match: {
                    monitor: { $in: monitorIds }
                }
            },
            {
                $group: {
                    _id: null,
                    totalChecks: { $sum: 1 },
                    upChecks: { $sum: { $cond: [{ $eq: ['$status', 'up'] }, 1, 0] } },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            }
        ]);

        if (summary.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalMonitors: userMonitors.length,
                    overallUptimePercentage: 100,
                    averageResponseTime: 0,
                    totalChecks: 0,
                }
            });
        }

        const { totalChecks, upChecks, avgResponseTime } = summary[0];
        const overallUptimePercentage = (upChecks / totalChecks) * 100;

        res.status(200).json({
            success: true,
            data: {
                totalMonitors: userMonitors.length,
                overallUptimePercentage: parseFloat(overallUptimePercentage.toFixed(2)),
                averageResponseTime: Math.round(avgResponseTime || 0),
                totalChecks
            }
        });

    } catch (error) {
        console.error(`Error getting overall summary: ${error.message}`.red);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};