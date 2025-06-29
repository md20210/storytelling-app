// backend/server.js - Main Entry Point for Storytelling App
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// Nach require('dotenv').config();
console.log('🔍 ALL ENV VARS:', Object.keys(process.env).filter(key => key.includes('GROK')));
console.log('🔍 Raw GROK_API_KEY:', JSON.stringify(process.env.GROK_API_KEY));

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Storytelling API Server...');
console.log('📦 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔍 Grok API Key Debug:', process.env.GROK_API_KEY ? 'Found' : 'Missing');
console.log('🔍 Key starts with:', process.env.GROK_API_KEY ? process.env.GROK_API_KEY.substring(0, 10) : 'N/A');

// Security & CORS
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
        'https://storytelling-app-production.up.railway.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'Storytelling API - Healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            authentication: true,
            books: true,
            chapters: true,
            grokAI: !!process.env.GROK_API_KEY,
            database: 'PostgreSQL',
            textToSpeech: false, // Phase 2
            voiceCommands: false // Phase 2
        },
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

// Temporary test routes (will be replaced with real routes)
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from frontend build (for production)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all handler for React Router (SPA)
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found',
            endpoint: req.url
        });
    }
    
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                message: 'Frontend not built. Run: npm run build',
                hint: 'This is normal in development mode'
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Am Ende von server.js, VOR app.listen()
// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all handler for React Router (SPA)
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found',
            endpoint: req.url
        });
    }
    
    // Serve React app for all other routes
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            res.send(`
                <h1>🚀 Storytelling App</h1>
                <p>✅ Backend is running!</p>
                <p>✅ Grok AI integrated</p>
                <p><a href="/health">Health Check</a></p>
                <p><a href="/api/test">API Test</a></p>
            `);
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Storytelling API running on port ${PORT}`);
    console.log(`📚 Features available:`);
    console.log(`   👤 Authentication: ⏳ (Routes not loaded yet)`);
    console.log(`   📖 Books Management: ⏳ (Routes not loaded yet)`);
    console.log(`   📝 Chapters Management: ⏳ (Routes not loaded yet)`);
    console.log(`   🤖 Grok AI: ${process.env.GROK_API_KEY ? '✅' : '❌ (API key missing)'}`);
    console.log(`   🗄️ Database: ⏳ (Models not loaded yet)`);
    console.log(`   🎙️ Text-to-Speech: ⏳ Phase 2`);
    console.log(`   🎤 Voice Commands: ⏳ Phase 2`);
    console.log(`🌟 Basic server ready! Add routes and database for full functionality.`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Promise Rejection:', err);
    process.exit(1);
});