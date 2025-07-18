const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const colors = require('colors');

const dbConnect = require('./config/database');
const authRouter = require('./routes/authRoutes');
const monitorRouter = require('./routes/monitorRoutes');
const userRouter = require('./routes/userRoutes');
const reportRouter = require('./routes/reportRouter');

require('dotenv').config();

const PORT = process.env.PORT || 8000;

const app = express();
dbConnect();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/monitors', monitorRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reports', reportRouter);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Uptime Robot Backend API is running successfully"
    })
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.green);
})
