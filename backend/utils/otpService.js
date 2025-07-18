const nodemailer = require('nodemailer');
require('dotenv').config();
const colors = require('colors');

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
 * Generates a 6-digit OTP and sends it to the user's email.
 * @param {object} user - The Mongoose user document.
 * @returns {string} The generated OTP.
 */

exports.sendOtp = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOptions = {
        from: `"Uptime Monitor" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Verification Code',
        html: `
            <h1>Verification Code</h1>
            <p>Your one-time password is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${user.email}`.green);
    } catch (error) {
        console.error(`Failed to send OTP to ${user.email}: ${error.message}`.red);
        throw new Error(`Failed to send OTP`.red);
    }

    return otp;
};