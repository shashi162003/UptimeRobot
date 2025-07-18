// seed.js
// This script populates the database with sample data for testing.

const mongoose = require('mongoose');
const colors = require('colors');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import Mongoose models
const User = require('./models/User');
const Monitor = require('./models/Monitor');
const NotificationChannel = require('./models/NotificationChannel');
const StatusLog = require('./models/StatusLog');

// Database connection
const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected for Seeding: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
}

// --- Sample Data ---
const sampleUser = {
    username: 'testuser',
    email: 'testuser@example.com', // Change this to an email you can access
    password: 'Password123'
};

// --- FIX APPLIED: Added a 'status' field to each monitor ---
const sampleMonitors = [
    {
        name: 'Google DNS',
        url: 'https://8.8.8.8',
        interval: 1,
        status: 'down' // Set initial status to 'down'
    },
    {
        name: 'Cloudflare DNS',
        url: 'https://1.1.1.1',
        interval: 1,
        status: 'down' // Set initial status to 'down'
    },
    {
        name: 'Example.com',
        url: 'http://example.com',
        interval: 2,
        status: 'down' // Set initial status to 'down'
    },
];

// --- Seeding Functions ---

const importData = async () => {
    try {
        // 1. Clear existing data
        await User.deleteMany();
        await Monitor.deleteMany();
        await NotificationChannel.deleteMany();
        await StatusLog.deleteMany();
        console.log('Data Destroyed!'.red.inverse);

        // 2. Create User
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(sampleUser.password, salt);
        const createdUser = await User.create({
            username: sampleUser.username,
            email: sampleUser.email,
            password: hashedPassword,
        });
        console.log(`User created: ${createdUser.username}`.green);

        // 3. Create Notification Channels for the user
        const emailChannel = await NotificationChannel.create({
            user: createdUser._id,
            type: 'email',
            target: createdUser.email, // Use the user's email as the target
        });
        console.log(`Email channel created for: ${emailChannel.target}`.green);

        // 4. Create Monitors for the user
        const monitorsToCreate = sampleMonitors.map(monitor => ({
            ...monitor,
            user: createdUser._id,
            // Link the email channel to the first two monitors
            notificationChannels: [emailChannel._id],
        }));

        await Monitor.insertMany(monitorsToCreate);
        console.log(`${monitorsToCreate.length} monitors created.`.green);

        console.log('Data Imported Successfully!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Monitor.deleteMany();
        await NotificationChannel.deleteMany();
        await StatusLog.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit(1);
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// --- Main Execution Logic ---
const run = async () => {
    await dbConnect();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();
