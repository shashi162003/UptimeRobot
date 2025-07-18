const User = require('../models/User');
const bcrypt = require('bcrypt');

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

exports.changePassword = async (req, res) => {
    const {currentPassword, newPassword, confirmNewPassword} = req.body;
    try {
        const id = req.user._id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match"
            });
        }
        const genSalt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, genSalt);
        user.password = hashedPassword;
        await user.save();
        console.log(`Password changed for user: ${user.username}`.blue);
        console.log(`${user}`.blue);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (error) {
        console.error(`Error changing password: ${error.message}`.red);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

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