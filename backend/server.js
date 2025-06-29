// backend/server.js - Mit Frontend Serving
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

// Security Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://storytelling-app-production.up.railway.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

// Serve static files from React build (in production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    console.log('📂 Serving static files from:', path.join(__dirname, '../frontend/dist'));
}

// Health Check Route
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
            database: 'PostgreSQL',
            frontend: process.env.NODE_ENV === 'production' ? 'Static Served' : 'Development'
        },
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

// ===== API ROUTES =====

// Mock Authentication Middleware (simplified for now)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // For now, just pass through - implement JWT verification later
    req.user = { id: 1, email: 'test@example.com' };
    next();
};

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    // Mock registration
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
            id: 1,
            email,
            firstName,
            lastName,
            createdAt: new Date().toISOString()
        },
        token: 'mock_jwt_token_' + Date.now()
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Mock login
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: 1,
            email,
            firstName: 'Demo',
            lastName: 'User'
        },
        token: 'mock_jwt_token_' + Date.now()
    });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Books Routes
app.get('/api/books', authenticateToken, (req, res) => {
    // Mock books data
    res.json({
        success: true,
        books: [
            {
                id: 1,
                title: 'My First Story',
                description: 'An amazing adventure',
                genre: 'Adventure',
                status: 'draft',
                chaptersCount: 3,
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-20T14:45:00Z'
            },
            {
                id: 2,
                title: 'Mystery Novel',
                description: 'A thrilling mystery',
                genre: 'Mystery',
                status: 'published',
                chaptersCount: 5,
                createdAt: '2024-01-10T09:00:00Z',
                updatedAt: '2024-01-25T16:30:00Z'
            }
        ]
    });
});

app.post('/api/books', authenticateToken, (req, res) => {
    const { title, description, genre } = req.body;
    
    // Mock book creation
    res.status(201).json({
        success: true,
        message: 'Book created successfully',
        book: {
            id: Date.now(),
            title,
            description,
            genre,
            status: 'draft',
            chaptersCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    });
});

app.get('/api/books/:id', authenticateToken, (req, res) => {
    const bookId = parseInt(req.params.id);
    
    // Mock book detail
    res.json({
        success: true,
        book: {
            id: bookId,
            title: 'Sample Book',
            description: 'A sample book description',
            genre: 'Fiction',
            status: 'draft',
            chaptersCount: 2,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z',
            chapters: [
                {
                    id: 1,
                    title: 'Chapter 1: The Beginning',
                    content: 'Once upon a time...',
                    order: 1,
                    wordCount: 250
                },
                {
                    id: 2,
                    title: 'Chapter 2: The Adventure',
                    content: 'The adventure continues...',
                    order: 2,
                    wordCount: 180
                }
            ]
        }
    });
});

// Stories alias (same as books)
app.get('/api/stories', authenticateToken, (req, res) => {
    // Redirect to books endpoint
    req.url = '/api/books';
    app._router.handle(req, res);
});

// Chapters Routes
app.get('/api/books/:bookId/chapters', authenticateToken, (req, res) => {
    const bookId = parseInt(req.params.bookId);
    
    // Mock chapters
    res.json({
        success: true,
        chapters: [
            {
                id: 1,
                bookId,
                title: 'Chapter 1: The Beginning',
                content: 'Once upon a time, in a land far away...',
                order: 1,
                wordCount: 250,
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-20T14:45:00Z'
            },
            {
                id: 2,
                bookId,
                title: 'Chapter 2: The Adventure',
                content: 'The adventure continues with unexpected twists...',
                order: 2,
                wordCount: 180,
                createdAt: '2024-01-16T11:00:00Z',
                updatedAt: '2024-01-21T15:20:00Z'
            }
        ]
    });
});

app.post('/api/books/:bookId/chapters', authenticateToken, (req, res) => {
    const bookId = parseInt(req.params.bookId);
    const { title, content } = req.body;
    
    // Mock chapter creation
    res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        chapter: {
            id: Date.now(),
            bookId,
            title,
            content,
            order: 1,
            wordCount: content ? content.split(' ').length : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    });
});

// Grok AI Routes
app.post('/api/grok/chat', authenticateToken, (req, res) => {
    const { message, context } = req.body;
    
    // Mock Grok response
    res.json({
        success: true,
        response: {
            message: `AI Response to: "${message}". This is a mock response for development.`,
            suggestions: [
                'Consider adding more descriptive details',
                'Develop the character\'s motivation',
                'Create more tension in this scene'
            ],
            tokens_used: 45
        }
    });
});

app.post('/api/grok/generate', authenticateToken, (req, res) => {
    const { prompt, type } = req.body;
    
    // Mock content generation
    res.json({
        success: true,
        content: {
            generated_text: `Generated content based on: "${prompt}". This is a mock AI-generated response that would normally come from Grok AI.`,
            type: type || 'story',
            word_count: 25,
            suggestions: [
                'Expand on character development',
                'Add dialogue to make it more engaging'
            ]
        }
    });
});

app.get('/api/grok/status', authenticateToken, (req, res) => {
    res.json({
        success: true,
        status: {
            grok_available: !!process.env.GROK_API_KEY,
            api_key_configured: !!process.env.GROK_API_KEY,
            model: process.env.GROK_MODEL || 'grok-2-1212',
            last_check: new Date().toISOString()
        }
    });
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method,
        available_endpoints: [
            'GET /api/books',
            'POST /api/books',
            'GET /api/books/:id',
            'GET /api/stories (alias for books)',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/profile',
            'GET /api/books/:bookId/chapters',
            'POST /api/books/:bookId/chapters',
            'POST /api/grok/chat',
            'POST /api/grok/generate',
            'GET /api/grok/status',
            'GET /health'
        ]
    });
});

// Serve React App for all non-API routes (in production)
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
} else {
    // Development fallback
    app.get('/', (req, res) => {
        res.json({
            message: 'Storytelling API Server - Development Mode',
            version: '1.0.0',
            frontend: 'Run `npm run dev` to start React development server',
            api_documentation: '/health',
            api_endpoints: '/api/*'
        });
    });
}

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('🔥 Server Error:', error.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Storytelling API running on port ${PORT}`);
    console.log(`🌟 Server ready for Railway!`);
    console.log(`📋 Available routes:`);
    console.log(`   - GET  /health`);
    console.log(`   - GET  /api/books`);
    console.log(`   - GET  /api/stories`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET  /api/grok/status`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`   - GET  /* (React App)`);
    }
});