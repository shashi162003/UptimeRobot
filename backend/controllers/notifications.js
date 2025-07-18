const NotificationChannel = require('../models/NotificationChannel');
const Monitor = require('../models/Monitor');

exports.createChannel = async (req, res) => {
    const {type, target} = req.body;
    try{
        if(!type || !target){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }
        const existingChannel = await NotificationChannel.findOne({user: req.user._id, type, target});
        if(existingChannel){
            return res.status(400).json({
                success: false,
                message: "Notification channel already exists"
            });
        }
        const newChannel = await NotificationChannel.create({user: req.user._id, type, target});
        console.log(`Notification channel created: ${newChannel.type}`.blue);
        console.log(`${newChannel}`.blue);
        return res.status(201).json({
            success: true,
            data: newChannel
        });
    }
    catch(error){
        console.error(`Error creating notification channel: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.getChannels = async (req, res) => {
    try{
        const channels = await NotificationChannel.find({user: req.user._id});
        console.log(`Fetched ${channels.length} notification channels for user ID: ${req.user._id}`.blue);
        return res.status(200).json({
            success: true,
            data: channels
        });
    }
    catch(error){
        console.error(`Error fetching notification channels: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.deleteChannel = async (req, res) => {
    const {channelId} = req.params;
    try{
        const channel = await NotificationChannel.findOneAndDelete({_id: channelId, user: req.user._id});
        if(!channel){
            return res.status(404).json({
                success: false,
                message: "Notification channel not found"
            });
        }
        console.log(`Notification channel deleted: ${channel.type}`.blue);
        console.log(`${channel}`.blue);
        return res.status(200).json({
            success: true,
            message: "Notification channel deleted successfully"
        });
    }
    catch(error){
        console.error(`Error deleting notification channel: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.linkChannelsToMonitor = async (req, res) => {
    try {
        const monitorId = req.params.id;
        const { channelIds } = req.body;

        if (!Array.isArray(channelIds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'channelIds must be an array.' 
            });
        }

        const monitor = await Monitor.findOne({ _id: monitorId, user: req.user._id });
        if (!monitor) {
            return res.status(404).json({ success: false, message: 'Monitor not found or you are not authorized' });
        }

        monitor.notificationChannels = channelIds;
        await monitor.save();

        const updatedMonitor = await monitor.populate('notificationChannels');

        console.log(`Channels linked to monitor: ${monitor.name}`.blue);
        console.log(`${updatedMonitor}`.blue);

        res.status(200).json({ 
            success: true, 
            data: updatedMonitor 
        });

    } catch (error) {
        console.error(`Error linking channels: ${error.message}`.red);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

exports.testChannel = async (req, res) => {
    const { channelId } = req.body;
    console.log(`--- SIMULATING TEST NOTIFICATION ---`.yellow);
    console.log(`A test alert would be sent to channel ID: ${channelId}`.yellow);
    console.log(`------------------------------------`.yellow);

    res.status(200).json({ 
        success: true,
        message: 'Test notification sent successfully (simulated).' 
    });
};