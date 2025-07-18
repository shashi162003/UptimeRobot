const brcypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async(req, res) => {
    const {username, email, password, confirmPassword} = req.body;
    try{
        if(!username || !email || !password || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            })
        }
        const existingUser = await User.findOne({
            $or: [{username}, {email}]
        })
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "Username or email already exists"
            })
        }
        const genSalt = await brcypt.genSalt(12);
        const hashedPassword = await brcypt.hash(password, genSalt);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })
        console.log(`User registered: ${user.username}`.green);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token
        })
    }
    catch(error){
        console.error(`Error registering user: ${error.message}`.red);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.login = async (req, res) => {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        const isMatch = await brcypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })
        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        console.log(`User logged in: ${user.username}`.green);
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token
        })
    }
    catch(error){
        console.error(`Error logging in user: ${error.message}`.red);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}