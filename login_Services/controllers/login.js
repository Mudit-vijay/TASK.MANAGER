const express = require('express');
const loginSchema = require('../schemas/customer_Schema.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

const jwt_S = process.env.JWT;

// --------------------
// OTP Store (in-memory)
const otpStore = new Map(); // key: email, value: otp

// --------------------
// Helper function to generate OTP
function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

// --------------------
// Brevo Mail Sender (FIXED)
async function sendEmail(receiveremail, otp) {
    console.log("comes in that ")
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "My App",
                email: process.env.SENDGRID_VERIFIED_EMAIL // must be verified in Brevo
            },
            to: [
                {
                    email: receiveremail
                }
            ],
            subject: "OTP VERIFICATION",
            htmlContent: `<h2>Here is your OTP for email verification</h2><h1>${otp}</h1>`
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Brevo mail error:", data);
        throw new Error("Email sending failed");
    }

    console.log("Brevo mail sent:", data);
}

// --------------------
// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = generateOTP();
        otpStore.set(email, otp);

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            jwt_S,
            { expiresIn: '1h' }
        );

        await sendEmail(user.email, otp); // still optional as per your logic

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({
            _id: user._id,
            token: token,
            name: user.name,
            email: user.email,
        });

    } catch (err) {
        console.log(`Login error: ${err.message}`);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// --------------------
// Create User Controller
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, role, and password are required" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const otp = generateOTP();
        otpStore.set(email, otp);

        const role = "USER";
        const user = await loginSchema.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            { id: user._id },
            jwt_S,
            { expiresIn: '1h' }
        );

        await sendEmail(user.email, otp); // still optional

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            token: token,
            id: user._id,
            success: true,
            message: "User created successfully",
        });

    } catch (err) {
        console.log(`Error in creating user: ${err.message}`);
        if (err.code === 11000) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

// --------------------
// OAUTH Create User Controller
function generatePassword(length = 8) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

const OauthCreation = async (req, res) => {
    console.log("request comes here");

    const authHeader = req.headers['Authorization'] || req.get('Authorization');
    const token = authHeader.split(" ")[1];

    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const userInfo = await response.json();
        const email = userInfo.email;
        const name = userInfo.name;
        const role = "USER";

        const loggedin_user = await loginSchema.findOne({ email });
        if (loggedin_user) {
            const token = jwt.sign(
                { id: loggedin_user._id, email: loggedin_user.email, role: loggedin_user.role },
                jwt_S,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'LAX',
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.json({
                _id: loggedin_user._id,
                token,
                name: loggedin_user.name,
                email: loggedin_user.email,
            });
        }

        const user = await loginSchema.create({
            name,
            email,
            password: generatePassword(),
            role
        });

        const tokenn = jwt.sign(
            { id: user._id },
            jwt_S,
            { expiresIn: '12h' }
        );

        return res.status(201).json({
            token: tokenn,
            id: user._id,
            success: true,
            message: "User created successfully",
        });

    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

// --------------------
// OTP Verification
const otpVerification = async (req, res) => {
    try {
        const opt = req.body.data.otp;
        const email = req.body.data.email;
        const otp = otpStore.get(email);

        if (otp == opt) {
            return res.status(200).json({ msg: true });
        }
    } catch (err) {
        return res.status(401).json({ msg: true });
    }
};

module.exports = {
    login,
    createUser,
    OauthCreation,
    otpVerification
};
