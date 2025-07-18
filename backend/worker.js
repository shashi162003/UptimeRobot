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
 * Generates a stylish HTML email for a downtime alert.
 * @param {object} monitor - The monitor that is down.
 * @returns {string} The full HTML content for the email.
 */
const generateAlertEmailHtml = (monitor) => {
    const logoBase64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIHN0cm9rZT0iIzAwRkZBQSIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9IiMxMTE4MjciIC8+PHBhdGggZD0iTTE2IDEwdjZsNCAyIiBzdHJva2U9IiMwMEZGQUEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; background-color: #09090B; font-family: 'Inter', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px; background-color: #18181B; color: #E4E4E7; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { display: inline-block; vertical-align: middle; margin-right: 10px; }
            .title { display: inline-block; vertical-align: middle; font-size: 24px; font-weight: bold; color: #FFFFFF; }
            .content { background-color: #27272A; padding: 30px; border-radius: 8px; }
            .alert-icon { font-size: 48px; color: #EF4444; text-align: center; }
            .details-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
            .details-table td { padding: 8px; border-bottom: 1px solid #3F3F46; }
            .details-table td:first-child { font-weight: bold; color: #A1A1AA; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #A1A1AA; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="data:image/svg+xml;base64,${logoBase64}" alt="Logo" width="32" height="32" class="logo">
                <span class="title">UptimeTracker</span>
            </div>
            <div class="content">
                <div class="alert-icon">&#9888;</div>
                <h2 style="color: #EF4444; text-align: center;">Downtime Alert</h2>
                <p style="text-align: center;">One of your monitors has been detected as DOWN.</p>
                <table class="details-table">
                    <tr>
                        <td>Monitor Name:</td>
                        <td>${monitor.name}</td>
                    </tr>
                    <tr>
                        <td>URL:</td>
                        <td><a href="${monitor.url}" style="color: #60A5FA;">${monitor.url}</a></td>
                    </tr>
                    <tr>
                        <td>Time of Detection:</td>
                        <td>${new Date().toLocaleString()}</td>
                    </tr>
                </table>
            </div>
            <div class="footer">
                <p>We will notify you again once this monitor is back up.</p>
                <p>&copy; ${new Date().getFullYear()} UptimeTracker. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const sendNotification = async (monitor) => {
    console.log(`[ALERT]`.red + ` Preparing to send notification for "${monitor.name}"...`.yellow);

    if (!monitor.notificationChannels || monitor.notificationChannels.length === 0) {
        console.log(`[ALERT]`.yellow + ` No notification channels configured for ${monitor.name}.`);
        return;
    }

    for (const channel of monitor.notificationChannels) {
        if (channel.type === 'email') {
            const mailOptions = {
                from: `"UptimeTracker" <${process.env.EMAIL_USER}>`,
                to: channel.target,
                subject: `🚨 Alert: Your monitor "${monitor.name}" is DOWN`,
                html: generateAlertEmailHtml(monitor),
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

const checkMonitor = async (monitor) => {
    const logData = { monitor: monitor._id, status: 'down', responseTime: 0, error: null };
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
