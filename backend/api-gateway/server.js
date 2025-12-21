const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => {
    return req.path === '/health' || req.headers.upgrade === 'websocket';
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', express.json(), (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[GATEWAY] Proxying ${req.method} ${req.url} -> Auth Service`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[GATEWAY] Response from Auth Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Proxy error:', err.message);
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': ''
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[GATEWAY] Proxying ${req.method} ${req.url} -> User Service`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[GATEWAY] Response from User Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Proxy error:', err.message);
  }
}));

app.use('/api/chat', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/chat': ''
  },
  ws: true,
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[GATEWAY] Proxying ${req.method} ${req.url} -> Chat Service`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[GATEWAY] Response from Chat Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[GATEWAY] Proxy error:', err.message);
  }
}));

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
