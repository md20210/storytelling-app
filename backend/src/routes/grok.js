// backend/src/routes/grok.js
const express = require('express');
const grokController = require('../controllers/grokController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Apply rate limiting to Grok routes (more restrictive for AI calls)
const grokRateLimiter = rateLimiter.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window per user
    message: {
        success: false,
        message: 'Too many AI requests. Please try again later.',
        retryAfter: 15 * 60 // 15 minutes
    }
});

router.use(grokRateLimiter);

// Grok API routes
router.get('/status', grokController.getStatus);                    // GET /api/grok/status
router.post('/test', grokController.testConnection);                // POST /api/grok/test
router.post('/chat', grokController.chat);                         // POST /api/grok/chat
router.post('/generate', grokController.generateContent);           // POST /api/grok/generate
router.post('/batch', grokController.batchProcess);                 // POST /api/grok/batch

module.exports = router;