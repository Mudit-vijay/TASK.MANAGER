// controllers/login.js
const express = require('express');
const api = require('../api.js');
const app = express.Router();  // <-- use router, not app

app.use(express.json());

app.post('/login', async (req, res) => {
    console.log("request comes 1");
    console.log(req.body);
    const { email, password } = req.body;
    // console.log(req.body);
    if (!email || !password) {
        return res.status(400).json({ msg: 'email and password are required' });
    }
    try {
        const response = await api.authapi.post('/login', req.body);
        // console.log(response);
        return res.status(200).json(response.data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'internal server error' });
    }
});

app.post('/createUser', async (req, res) => {
    console.log("request comes 1");
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'name, email, and password are required' });
    }
    console.log(req.body);
    try {
        const response = await api.authapi.post('/createUser', req.body);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'internal server error' });
    }
});

app.post('/oauthcreation', async (req, res) => {
    console.log("atleast request comes here");

    try {
        // Extract token from request headers
        const header = req.headers["Authorization"];
        console.log(req.headers);
        console.log(header);
        if (!header) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = header.split(" ")[1];
        console.log(token);

        if (!token) {
            return res.status(401).json({ msg: "Authorization header missing" });
        }

        // Forward request to your Spring/other API
        const response = await api.authapi.post(
            '/oauthcreation',
            {}, // body (empty if not needed)
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("logging out response in gateway");
        console.log(response);
        return res.status(200).json({
            msg: "Account creation successful",
            data: response.data
        });
    } catch (err) {
        console.error("OAuth creation failed:", err.message);
        return res.status(500).json({
            msg: "Not able to create your account",
            error: err.message
        });
    }
});
app.post('/otpverification', async (req, res) => {
    try {
        console.log("otp request comes in gateway");
        const response = await api.authapi.post('/otpVerification', req.body);

        return res.status(200).json({
            msg: "otp verification successful",
            data: response.data
        });

    } catch (err) {
        return res.status(401).json({ msg: "otp verification completed successfull" })
    }
});

module.exports = app;  // <-- export router
