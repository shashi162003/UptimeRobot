const mongoose = require('mongoose');
require('dotenv').config();
const colors = require('colors');

const MONGODB_URL = process.env.MONGODB_URL;

const dbConnect = async () => {
    try{
        const conn = await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`.green);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
}

module.exports = dbConnect;