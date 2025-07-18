const express = require('express');
const reportRouter = express.Router();

const { getMonitorLogs, getMonitorSummary, getOverallSummary } = require('../controllers/reports');

reportRouter.get('/monitors/:id/logs', getMonitorLogs);
reportRouter.get('/monitors/:id/summary', getMonitorSummary);
reportRouter.get('/summary', getOverallSummary);

module.exports = reportRouter;