const express = require('express');
const { login, createUser, OauthCreation, otpVerification } = require('../controllers/login');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();
router.use(express.json());
const URI = process.env.GOOGLE_REDIRECT_URI
// --- Existing routes ---
router.post('/login', login);
router.post('/createUser', createUser);
router.post('/oauthcreation', OauthCreation)
router.post('/otpVerification', otpVerification)
module.exports = router;
