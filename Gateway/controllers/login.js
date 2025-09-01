// controllers/login.js
const express = require('express');
const api = require('../api.js');
const app = express.Router();  // <-- use router, not app

app.use(express.json());

app.post('/login', async (req, res) => {
    console.log("request comes 1");
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
        return res.status(400).json({ msg: 'email and password are required' });
    }
    try {
        const response = await api.authapi.post('/login', req.body);
        console.log(response);
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

module.exports = app;  // <-- export router
