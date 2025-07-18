const express = require('express');
const reportRouter = express.Router();

const { getMonitorLogs, getMonitorSummary, getOverallSummary } = require('../controllers/reports');
const authMiddleware = require('../middlewares/authMiddleware');

reportRouter.get('/monitors/:id/logs', authMiddleware, getMonitorLogs);
reportRouter.get('/monitors/:id/summary', authMiddleware, getMonitorSummary);
reportRouter.get('/summary', authMiddleware, getOverallSummary);

module.exports = reportRouter;