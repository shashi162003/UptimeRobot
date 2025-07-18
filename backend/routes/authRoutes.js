const express = require('express');
const { register, login, verifyRegistrationOtp, verifyLoginOtp } = require('../controllers/userAuth');
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/register/verify', verifyRegistrationOtp);

authRouter.post('/login', login);
authRouter.post('/login/verify', verifyLoginOtp);

module.exports = authRouter;