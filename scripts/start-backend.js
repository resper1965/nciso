#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Configuração de graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando graciosamente...');
  process.exit(0);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API routes
try {
  app.use('/api/v1/platform', require('../src/api/platform'));
  app.use('/api/v1/platform/invites', require('../src/api/platform/invites'));
  app.use('/api/v1/isms', require('../src/api/isms'));
  app.use('/api/v1/controls', require('../src/api/controls'));
  app.use('/api/v1/audit', require('../src/api/audit'));
  app.use('/api/v1/risk', require('../src/api/risk'));
  app.use('/api/v1/privacy', require('../src/api/privacy'));
  app.use('/api/v1/secdevops', require('../src/api/secdevops'));
  app.use('/api/v1/assessments', require('../src/api/assessments'));
  app.use('/api/v1/cirt', require('../src/api/cirt'));
  app.use('/api/v1/tickets', require('../src/api/tickets'));
} catch (error) {
  console.log('⚠️ Algumas rotas não foram carregadas:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 n.ciso API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

module.exports = app; 