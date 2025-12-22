const loginSchema = require('../schemas/customer_Schema.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
require('dotenv').config();

// ======================
// CONFIG
// ======================
const JWT_SECRET = process.env.JWT;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const VERIFIED_SENDER_EMAIL = process.env.SENDGRID_VERIFIED_EMAIL;

// ======================
// OTP STORE (in-memory)
// email -> { otp, expiresAt }
// ======================
const otpStore = new Map();

// ======================
// OTP GENERATOR
// ======================
function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

// ======================
// BREVO EMAIL SENDER
// ======================
async function sendEmail(receiverEmail, otp) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "My App",
                email: VERIFIED_SENDER_EMAIL // MUST be verified in Brevo
            },
            to: [{ email: receiverEmail }],
            subject: "OTP Verification",
            htmlContent: `
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
            `
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Brevo Error:", data);
        throw new Error("Email sending failed");
    }
}

// ======================
// LOGIN CONTROLLER
// ======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await loginSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        await sendEmail(email, otp);

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({
            _id: user._id,
            token,
            name: user.name,
            email: user.email
        });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// ======================
// CREATE USER CONTROLLER
// ======================
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await loginSchema.create({
            name,
            email,
            password: hashedPassword,
            role: "USER"
        });

        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        await sendEmail(email, otp);

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'LAX',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            token,
            id: user._id,
            message: "User created successfully"
        });

    } catch (err) {
        console.error("Create user error:", err.message);

        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }

        return res.status(500).json({ message: "Server error" });
    }
};

// ======================
// OTP VERIFICATION
// ======================
const otpVerification = async (req, res) => {
    try {
        const { otp, email } = req.body.data;

        const record = otpStore.get(email);
        if (!record) {
            return res.status(400).json({ msg: "OTP expired or invalid" });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ msg: "OTP expired" });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        otpStore.delete(email); // one-time use
        return res.status(200).json({ msg: true });

    } catch (err) {
        return res.status(500).json({ msg: "OTP verification failed" });
    }
};

// ======================
// EXPORTS
// ======================
module.exports = {
    login,
    createUser,
    otpVerification
};
