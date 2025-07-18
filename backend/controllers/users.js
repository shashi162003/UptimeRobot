const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendOtp } = require('../utils/otpService');

exports.getUserProfile = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findById(id).select('-password');
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log(`User profile retrieved: ${user.username}`.blue);
        console.log(`${user}`.blue);
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error(`Error retrieving user profile: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.updateUserProfile = async (req, res) => {
    const {username, email} = req.body;
    try {
        const id = req.user._id;
        const existingUser = await User.findOne({
            $or: [{username}, {email}],
            _id: {$ne: id}
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or email already in use"
            });
        }
        const user = await User.findByIdAndUpdate(id, {
            username,
            email
        }, {new: true}).select('-password');
        console.log(`User profile updated: ${user.username}`.blue);
        console.log(`${user}`.blue);
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error(`Error updating user profile: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.requestPasswordChange = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log(`Requesting password change for user: ${user.username}`.blue);
        console.log(`${user}`.blue);

        await sendOtp(user);

        res.status(200).json({ 
            success: true,
            message: `OTP sent to ${user.email}.`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal server error"
        });
    }
};

exports.verifyPasswordChange = async (req, res) => {
    const { otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ _id: req.user._id, otp, otpExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid OTP or OTP has expired." 
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.otp = undefined;
        user.otpExpires = undefined;

        console.log(`Password changed for user: ${user.username}`.blue);
        console.log(`${user}`.blue);

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Password changed successfully." 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteUserAccount = async (req, res) => {
    try {
        const id = req.user._id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log(`User account deleted: ${user.username}`.blue);
        console.log(`${user}`.blue);
        return res.status(200).json({
            success: true,
            message: "User account deleted successfully"
        });
    }
    catch (error) {
        console.error(`Error deleting user account: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}