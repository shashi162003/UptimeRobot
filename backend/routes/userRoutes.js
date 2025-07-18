const express = require('express');
const userRouter = express.Router();

const { getUserProfile, updateUserProfile, changePassword, deleteUserAccount, requestPasswordChange, verifyPasswordChange } = require('../controllers/users');
const authMiddleware = require('../middlewares/authMiddleware');

userRouter.get('/me', authMiddleware, getUserProfile);
userRouter.put('/me', authMiddleware, updateUserProfile);
userRouter.delete('/me', authMiddleware, deleteUserAccount);

userRouter.post('/change-password/request', authMiddleware, requestPasswordChange);
userRouter.put('/change-password/verify', authMiddleware, verifyPasswordChange);


module.exports = userRouter;