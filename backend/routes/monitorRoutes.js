const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');

const monitorRouter = express.Router();

const {createMonitor, getMonitors, getMonitorById, updateMonitor, deleteMonitor, pauseMonitor, resumeMonitor} = require('../controllers/monitors');

monitorRouter.post('/', authMiddleware, createMonitor);
monitorRouter.get('/', authMiddleware, getMonitors);
monitorRouter.get('/:id', authMiddleware, getMonitorById);
monitorRouter.put('/:id', authMiddleware, updateMonitor);
monitorRouter.delete('/:id', authMiddleware, deleteMonitor);
monitorRouter.put('/:id/pause', authMiddleware, pauseMonitor);
monitorRouter.put('/:id/resume', authMiddleware, resumeMonitor);

module.exports = monitorRouter;