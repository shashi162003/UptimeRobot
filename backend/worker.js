const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const colors = require('colors');
const nodemailer = require('nodemailer');
require('dotenv').config();


const Monitor = require('./models/Monitor');
const StatusLog = require('./models/StatusLog');
const NotificationChannel = require('./models/NotificationChannel');

const dbConnect = require('./config/database');



const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a real email notification when a monitor goes down.
 * @param {object} monitor - The Mongoose monitor document that went down.
 */

const sendNotification = async (monitor) => {
    console.log(`[ALERT]`.red + ` Preparing to send notification for "${monitor.name}"...`.yellow);

    if (!monitor.notificationChannels || monitor.notificationChannels.length === 0) {
        console.log(`[ALERT]`.yellow + ` No notification channels configured for ${monitor.name}.`);
        return;
    }

    for (const channel of monitor.notificationChannels) {
        if (channel.type === 'email') {
            const mailOptions = {
                from: `"Uptime Monitor" <${process.env.EMAIL_USER}>`,
                to: channel.target,
                subject: `🚨 Alert: Your monitor "${monitor.name}" is DOWN`,
                html: `
                    <h1>Uptime Alert</h1>
                    <p>This is an automated alert to inform you that your monitor has been detected as <strong>DOWN</strong>.</p>
                    <ul>
                        <li><strong>Name:</strong> ${monitor.name}</li>
                        <li><strong>URL:</strong> ${monitor.url}</li>
                        <li><strong>Time of Detection:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <p>We will notify you again once it is back up.</p>
                `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`[SUCCESS]`.green + ` Alert email sent to ${channel.target}`);
            } catch (error) {
                console.error(`[FAILURE]`.red + ` Failed to send email to ${channel.target}: ${error.message}`);
            }
        }
    }
};


/**
 * Performs an HTTP check on a single monitor.
 * @param {object} monitor - The Mongoose monitor document to check.
 */

const checkMonitor = async (monitor) => {
    const logData = {
        monitor: monitor._id,
        status: 'down', 
        responseTime: 0,
        error: null
    };

    const startTime = Date.now();
    try {
        const response = await axios.get(monitor.url, { timeout: 10000 });
        logData.responseTime = Date.now() - startTime;

        if (response.status >= 200 && response.status < 400) {
            logData.status = 'up';
            console.log(`[SUCCESS]`.green + ` ${monitor.name} is UP. Status: ${response.status}. Response Time: ${logData.responseTime}ms`);
        } else {
            logData.error = `Received status code ${response.status}`;
            console.log(`[FAILURE]`.red + ` ${monitor.name} is DOWN. Status: ${response.status}`);
        }
    } catch (error) {
        logData.responseTime = Date.now() - startTime;
        logData.error = error.message;
        console.log(`[FAILURE]`.red + ` ${monitor.name} is DOWN. Error: ${error.message}`);
    }

    try {
        await StatusLog.create(logData);

        if (monitor.status === 'up' && logData.status === 'down') {
            await sendNotification(monitor);
        }

        monitor.status = logData.status;
        monitor.lastChecked = new Date();
        await monitor.save();

    } catch (dbError) {
        console.error(`Database error for monitor ${monitor.name}: ${dbError.message}`.red);
    }
};

/**
 * The main function for the cron job.
 */

const runChecks = async () => {
    console.log('\n---------------------------------'.cyan);
    console.log(`[WORKER] Running scheduled monitor checks at ${new Date().toLocaleTimeString()}`.cyan);
    console.log('---------------------------------'.cyan);

    try {
        const monitorsToCheck = await Monitor.find({ status: { $ne: 'paused' } }).populate('notificationChannels');

        if (monitorsToCheck.length === 0) {
            console.log('[WORKER] No active monitors to check.'.gray);
            return;
        }

        console.log(`[WORKER] Found ${monitorsToCheck.length} active monitors.`.yellow);

        await Promise.all(monitorsToCheck.map(checkMonitor));

    } catch (error) {
        console.error('[WORKER] Critical error fetching monitors:'.red, error);
    }
};

const startWorker = async () => {
    console.log('Starting Uptime Monitor Worker...'.bold.blue);
    await dbConnect();

    cron.schedule('* * * * *', runChecks);

    console.log('Worker has been scheduled. Waiting for the next minute to start checks.'.blue);
};

startWorker();
