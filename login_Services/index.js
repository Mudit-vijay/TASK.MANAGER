const express = require('express');
const connectdb = require('./database/connect_DB.js')
require('dotenv').config();
const jwt = require('jsonwebtoken')
const jwt_S = process.env.JWT;

const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
const router = require('./routers/routes.js');


app.use(express.json());
app.use(cors({
    origin: 'https://task-manager-xp1g.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use('/api/v1/', router)
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ message: "token is not present" })
    }
    jwt.verify(token, jwt_S, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    })
}
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username || 'user'}, you accessed protected data!` });
});


const start = async () => {
    try {
        await connectdb(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log(err);

    }
}
start()

