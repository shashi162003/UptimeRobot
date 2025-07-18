const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {sendOtp} = require('../utils/otpService');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        let existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false, 
                message: "Username or email already exists" 
            });
        }

        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        const genSalt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, genSalt);
        const user = await User.create({ username, email, password: hashedPassword });

        console.log(`User registered: ${user.username}`.blue);
        console.log(`${user}`.blue);

        await sendOtp(user);

        res.status(200).json({
            success: true,
            message: `OTP sent to ${email}. Please verify to complete registration.`
        });
    } catch (error) {
        console.error(`Error registering user: ${error.message}`.red);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.verifyRegistrationOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP or OTP has expired."
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        console.log(`User verified: ${user.username}`.blue);
        console.log(`${user}`.blue);

        res.status(201).json({ 
            success: true, 
            message: "User registered successfully." 
        });

    } catch (error) {
        console.error(`Error verifying registration OTP: ${error.message}`.red);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials or user not verified." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials." 
            });
        }

        await sendOtp(user);

        console.log(`User logged in: ${user.username}`.blue);
        console.log(`${user}`.blue);

        res.status(200).json({
            success: true,
            message: `OTP sent to ${email}. Please verify to log in.`
        });

    } catch (error) {
        console.error(`Error logging in user: ${error.message}`.red);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid OTP or OTP has expired." 
            });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        console.log(`User logged in: ${user.username}`.blue);
        console.log(`${user}`.blue);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' 
        });

        res.status(200).json({ 
            success: true, 
            message: "Logged in successfully.", 
            token 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};