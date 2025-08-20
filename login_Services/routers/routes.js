const express = require('express')
const { login, createUser } = require('../controllers/login');
const router = express.Router();
router.use(express.json());
router.post('/login', login);
router.post('/createUser', createUser);
module.exports = router;