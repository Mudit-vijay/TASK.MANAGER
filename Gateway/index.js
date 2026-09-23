const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "https://task-manager-1-5jlg.onrender.com")
    .split(',').map(origin => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(compression());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use((req, res, next) => {
    const unsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const origin = req.get('origin');
    if (unsafeMethod && origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ msg: 'Request origin is not allowed.' });
    }
    next();
});

// Proxy for Authentication Service
const authProxy = createProxyMiddleware({
    target: process.env.LOGIN_SERVICE_URL || 'https://backend-b-wxdw.onrender.com',
    changeOrigin: true,
    pathFilter: ['/api/v1/login', '/api/v1/createUser', '/api/v1/oauthcreation', '/api/v1/otpVerification', '/api/v1/me', '/api/v1/logout', '/api/v1/admin/users'],
    on: {
        error: (err, req, res) => {
            console.error('Auth Proxy Error:', err.message);
            res.status(502).send('Auth Service is unreachable');
        }
    }
});

// Proxy for Task and Group Service
const taskGroupProxy = createProxyMiddleware({
    target: process.env.STARTER_SERVICE_URL || 'https://backend-a-tvul.onrender.com',
    changeOrigin: true,
    pathFilter: ['/api/v1/task', '/api/v1/group', '/api/v1/groups'],
});

// Proxy for OAuth Service
const oauthProxy = createProxyMiddleware({
    target: process.env.OAUTH_SERVICE_URL || 'https://oauth-service-fyrc.onrender.com',
    changeOrigin: true,
    pathFilter: ['/api/v1/oauth'],
});

app.use(authProxy);
app.use(taskGroupProxy);
app.use(oauthProxy);

// Basic health check route
app.get('/health', (req, res) => res.status(200).send('Gateway is healthy!'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`API Gateway is listening on port: ${port}`);
});
