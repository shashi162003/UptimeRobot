const express = require('express');
const notificationRouter = express.Router();

const {createChannel, getChannels, deleteChannel, linkChannelsToMonitor, testChannel} = require('../controllers/notifications');
const authMiddleware = require('../middlewares/authMiddleware');

notificationRouter.post('/channels', authMiddleware, createChannel);
notificationRouter.get('/channels', authMiddleware, getChannels);
notificationRouter.delete('/channels/:channelId', authMiddleware, deleteChannel);
notificationRouter.put('/monitors/:id/channels', authMiddleware, linkChannelsToMonitor);
notificationRouter.post('/channels/test', authMiddleware, testChannel);

module.exports = notificationRouter;