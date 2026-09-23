const express = require('express');
const connectdb = require('./database/connect_DB.js');
require('dotenv').config();
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 5000;
const router = require('./routers/routes.js');

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (process.env.CORS_ALLOWED_ORIGINS || "https://task-manager-1-5jlg.onrender.com")
        .split(',').map(origin => origin.trim()).filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));

app.use('/api/v1/', router);

const start = async () => {
    try {
        await connectdb(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};
start();
