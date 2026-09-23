const express = require('express');
const loginSchema = require('../schemas/customer_Schema.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

const jwt_S = process.env.JWT;
const isProduction = process.env.NODE_ENV !== 'development';
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/'
};

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

const establishSession = (res, user) => {
    const token = genrerateToken(user._id, user.email, user.role);
    res.cookie('token', token, authCookieOptions);
};

const login = async (req, res) => {
    console.log("login");
    try {
        const { email, password } = req.body;

        const data = await findUserDetails(email)
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordValid = bcrypt.compareSync(password, data.password);
        if (!isPasswordValid) {
            return res.status(400).json("Invalid password");
        }
        establishSession(res, data);
        return res.status(200).json({ user: publicUser(data) });

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
        const role = "USER";//make it dynamic **
        const user = await loginSchema.create({
            name,
            email,
            password: hashedPassword,
            role,
            emailVerified: false
        });

        establishSession(res, user);
        return res.status(201).json({ authenticated: true, user: publicUser(user) });

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
    console.log("request comes in backend");

    const authHeader = req.headers['authorization'] || req.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(400).json({ error: "OAuth access token is required" });

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
            establishSession(res, loggedin_user);
            return res.json({ user: publicUser(loggedin_user) });
        }

        const user = await loginSchema.create({
            name,
            email,
            password: generatePassword(),
            role,
            last_verified: Date.now()
        });
        establishSession(res, user);
        return res.status(201).json({ user: publicUser(user), success: true });

    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

const genrerateToken = (id, email, role) => {
    const token = jwt.sign(
        { id: id, email: email, role: role },
        jwt_S,
        { expiresIn: '1h' }
    );
    return token;
}
const getCurrentUser = (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ msg: "No active session" });
    try {
        const decoded = jwt.verify(token, jwt_S);
        return res.status(200).json({ user: decoded });
    } catch (error) {
        return res.status(401).json({ msg: "Session expired" });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax', path: '/' });
    return res.status(204).send();
};
async function findUserDetails(email) {
    return await loginSchema.findOne({ email });
}
const getAllUsersAdmin = async (req, res) => {
    try {
        const users = await loginSchema.find({}).select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

const deleteUserAdmin = async (req, res) => {
    try {
        const user = await loginSchema.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        await loginSchema.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Internal server error", error: err.message });
    }
};


module.exports = {
    login,
    createUser,
    OauthCreation,
    getCurrentUser,
    logout,
    getAllUsersAdmin,
    deleteUserAdmin
};
