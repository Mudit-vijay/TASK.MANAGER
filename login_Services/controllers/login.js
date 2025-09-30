const express = require('express');
const loginSchema = require('../schemas/customer_Schema.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const jwt_S = process.env.JWT;
// --------------------
// OTP Store (in-memory)
const otpStore = new Map(); // key: email, value: otp

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // make sure this is in your .env file

// Helper function to generate OTP
function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // random digit 0-9
    }
    return otp;
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

        // Generate OTP


        // Send OTP via SendGrid
        console.log("logging something")
        console.log(user.email)
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_VERIFIED_EMAIL, // Must be a verified sender in SendGrid
            subject: "Email Verification OTP",
            text: `Here is your OTP for login verification: ${otp}`,
            html: `<strong>Here is your OTP for login verification: ${otp}</strong>`,
        };
        sgMail.send(msg)
            .then(() => console.log('Test email sent successfully!'))
            .catch(err => console.error('Error sending email:', err.response.body));
        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Return OTP and user info (for frontend verification)
        return res.json({
            _id: user._id,
            token: token,
            name: user.name,
            email: user.email,
            // OTP: otp
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
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, email, role, and password are required" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const otp = generateOTP();
        otpStore.set(email, otp);
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

        // Generate OTP
        console.log(otp);

        // Send OTP via SendGrid
        console.log("logging something")
        console.log(user.email)
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_VERIFIED_EMAIL, // Verified sender
            subject: "Email Verification OTP",
            text: `Here is your OTP for account verification: ${otp}`,
            html: `<strong>Here is your OTP for account verification: ${otp}</strong>`,
        };

        await sgMail.send(msg, () => {
            console.log("message send successfull")
        });

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
            // OTP: otp
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
    console.log("Access Token:", token);

    try {
        // Use access token to get user info from Google API
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const userInfo = await response.json();
        console.log("User Info:", userInfo);
        const email = userInfo.email;
        const a = generatePassword();
        const name = userInfo.name
        const role = "USER"
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

            // Return OTP and user info (for frontend verification)
            return res.json({
                _id: loggedin_user._id,
                token: token,
                name: loggedin_user.name,
                email: loggedin_user.email,
                // OTP: otp
            });
        }
        const user = await loginSchema.create({
            name,
            email,
            password: a,
            role
        })
        console.log("logging out user");

        console.log(user);

        const tokenn = jwt.sign(
            { id: user._id },
            jwt_S,
            { expiresIn: '12h' }
        );
        console.log("printing out id");

        console.log(user._id);

        return res.status(201).json({
            token: tokenn,
            id: user._id,
            success: true,
            message: "User created successfully",
            // OTP: otp
        });

    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};
const otpVerification = async (req, res) => {
    try {
        console.log("otp request");
        const opt = req.body.data.otp
        const email = req.body.data.email
        const otp = otpStore.get(email);
        if (otp == opt) {
            console.log("succeed");
            return res.status(200).json({ msg: true })
        }
    }
    catch (err) {
        return res.status(401).json({ msg: true })
    }
}
module.exports = { login, createUser, OauthCreation, otpVerification };


