// backend/server.js - Sichere dotenv Konfiguration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Safe dotenv loading
try {
    if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
    }
} catch (error) {
    console.log('📝 dotenv not loaded (production mode)');
}

const app = express();
const PORT = process.env.PORT || 8080; // Railway Port

console.log('🚀 Starting Storytelling API Server...');
console.log('📦 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Debug Environment Variables (Railway fix)
console.log('🔍 Railway ENV Debug:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- GROK_API_KEY:', process.env.GROK_API_KEY ? 'FOUND' : 'MISSING');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');

// Rest of your server.js code...
// (Keep all the existing CORS, middleware, routes etc.)

// WICHTIG: Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Storytelling API - Healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            authentication: true,
            books: true,
            chapters: true,
            grokAI: !!process.env.GROK_API_KEY,
            database: 'PostgreSQL'
        },
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Storytelling API running on port ${PORT}`);
    console.log(`🌟 Server ready for Railway!`);
});