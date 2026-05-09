const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
    origin: [
        "https://task-manager-xp1g.onrender.com",
        "https://backend-a-tvul.onrender.com",
        "http://localhost:5173",
        "http://localhost:8080"
    ],
    credentials: true,
}));

// Proxy for Authentication Service
const authProxy = createProxyMiddleware({
    target: 'http://localhost:4282',
    changeOrigin: true,
    pathFilter: ['/api/v1/login', '/api/v1/createUser', '/api/v1/oauthcreation', '/api/v1/otpverification', '/api/v1/admin/users'],
    on: {
        error: (err, req, res) => {
            console.error('Auth Proxy Error:', err.message);
            res.status(502).send('Auth Service (port 4282) is unreachable');
        }
    }
});

// Proxy for Task and Group Service
const taskGroupProxy = createProxyMiddleware({
    target: 'http://localhost:9000',
    changeOrigin: true,
    pathFilter: ['/api/v1/task', '/api/v1/group', '/api/v1/groups'],
});

// Proxy for Algorithm Scheduler Service
const schedulerProxy = createProxyMiddleware({
    target: 'https://algorithm-scheduler.onrender.com',
    changeOrigin: true,
    pathFilter: ['/api/v1/scheduler'],
});

// Proxy for OAuth Service
const oauthProxy = createProxyMiddleware({
    target: 'http://localhost:9999',
    changeOrigin: true,
    pathFilter: ['/api/v1/oauth'],
});

app.use(authProxy);
app.use(taskGroupProxy);
app.use(schedulerProxy);
app.use(oauthProxy);

// Basic health check route
app.get('/health', (req, res) => res.status(200).send('Gateway is healthy!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`API Gateway is listening on port: ${port}`);
});
