const nodemailer = require('nodemailer');
require('dotenv').config();

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
 * Generates a stylish HTML email for OTP verification.
 * @param {string} otp - The One-Time Password.
 * @returns {string} The full HTML content for the email.
 */
const generateOtpEmailHtml = (otp) => {
    // Base64 encoded SVG logo for embedding in the email
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
            .otp-code { font-size: 36px; font-weight: bold; color: #00FFAA; text-align: center; letter-spacing: 8px; margin: 20px 0; }
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
                <h2 style="color: #FFFFFF; text-align: center;">Your Verification Code</h2>
                <p style="text-align: center;">Please use the following code to complete your action. This code is valid for 5 minutes.</p>
                <div class="otp-code">${otp}</div>
            </div>
            <div class="footer">
                <p>If you did not request this code, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} UptimeTracker. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};


/**
 * Generates a 6-digit OTP and sends it to the user's email.
 * @param {object} user - The Mongoose user document.
 * @returns {string} The generated OTP.
 */
exports.sendOtp = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    await user.save();

    const mailOptions = {
        from: `"UptimeTracker" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your UptimeTracker Verification Code: ${otp}`,
        html: generateOtpEmailHtml(otp),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${user.email}`.green);
    } catch (error) {
        console.error(`Failed to send OTP to ${user.email}: ${error.message}`.red);
    }

    return otp;
};
