const express = require('express');
const userRouter = express.Router();

const { getUserProfile, updateUserProfile, changePassword, deleteUserAccount } = require('../controllers/users');
const authMiddleware = require('../middlewares/authMiddleware');

userRouter.get('/me', authMiddleware, getUserProfile);
userRouter.put('/me', authMiddleware, updateUserProfile);
userRouter.put('/change-password', authMiddleware, changePassword);
userRouter.delete('/me', authMiddleware, deleteUserAccount);

module.exports = userRouter;