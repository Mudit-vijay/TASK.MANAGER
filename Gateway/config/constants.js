// config/constants.js

const AUTH_SERVICE_URL = process.env.LOGIN_SERVICE_URL || 'https://backend-b-wxdw.onrender.com';
const TASK_SERVICE_URL = process.env.STARTER_SERVICE_URL || 'https://backend-a-tvul.onrender.com';

module.exports = {
  AUTH_SERVICE_URL,
  TASK_SERVICE_URL,
};
