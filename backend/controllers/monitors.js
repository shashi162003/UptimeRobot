const Monitor = require('../models/Monitor');

exports.createMonitor = async (req, res) => {
    const {name, url, interval} = req.body;
    try{
        if(!name || !url || !interval){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }
        const monitor = await Monitor.create({
            user: req.user._id,
            name,
            url,
            interval
        });
        console.log(`Monitor created: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(201).json({
            success: true,
            data: monitor
        });
    }
    catch(error){
        console.error(`Error creating monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.getMonitors = async (req, res) => {
    try{
        const monitors = await Monitor.find({user: req.user._id});
        console.log(`Fetched ${monitors.length} monitors for user ID: ${req.user._id}`.blue);
        return res.status(200).json({
            success: true,
            data: monitors
        });
    }
    catch(error){
        console.error(`Error fetching monitors: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.getMonitorById = async (req, res) => {
    const {id} = req.params;
    try {
        const monitor = await Monitor.findOne({_id: id, user: req.user._id});
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found"
            });
        }
        console.log(`Fetched monitor: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(200).json({
            success: true,
            data: monitor
        });
    }
    catch (error) {
        console.error(`Error fetching monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.updateMonitor = async (req, res) => {
    const {id} = req.params;
    const {name, url, interval} = req.body;
    try {
        const monitor = await Monitor.findOneAndUpdate({_id: id, user: req.user._id}, {
            name,
            url,
            interval
        }, {new: true});
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found"
            });
        }
        console.log(`Monitor updated: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(200).json({
            success: true,
            data: monitor
        });
    }
    catch (error) {
        console.error(`Error updating monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.deleteMonitor = async (req, res) => {
    const {id} = req.params;
    try {
        const monitor = await Monitor.findOneAndDelete({_id: id, user: req.user._id});
        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found"
            });
        }
        console.log(`Monitor deleted: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(200).json({
            success: true,
            message: "Monitor deleted successfully"
        });
    }
    catch (error) {
        console.error(`Error deleting monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.pauseMonitor = async (req, res) => {
    const {id} = req.params;
    try {
        const monitor = await Monitor.findOne({_id: id, user: req.user._id});
        if(!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found"
            });
        }
        monitor.status = 'paused';
        await monitor.save();
        console.log(`Monitor paused: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(200).json({
            success: true,
            message: "Monitor paused successfully"
        });
    }
    catch (error) {
        console.error(`Error pausing monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.resumeMonitor = async (req, res) => {
    const {id} = req.params;
    try {
        const monitor = await Monitor.findOne({_id: id, user: req.user._id});
        if(!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found"
            });
        }
        monitor.status = 'down';
        await monitor.save();
        console.log(`Monitor resumed: ${monitor.name}`.blue);
        console.log(`${monitor}`.blue);
        return res.status(200).json({
            success: true,
            message: "Monitor resumed successfully. A status check will be performed shortly."
        });
    }
    catch (error) {
        console.error(`Error resuming monitor: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
