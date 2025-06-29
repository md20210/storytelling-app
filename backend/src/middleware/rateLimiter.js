// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Default rate limiter for general API routes
const defaultRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise fall back to IP
        return req.userId || req.ip;
    },
    handler: (req, res) => {
        console.log(⚠️ Rate limit exceeded for ${req.userId || req.ip} on ${req.url}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Strict rate limiter for authentication routes
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // For auth routes, use IP address only for security
        return req.ip;
    },
    handler: (req, res) => {
        console.log(`🚨 Auth rate limit exceeded for IP ${req.ip} on ${req.url}`);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: 15 * 60
        });
    }
});

// AI/Grok specific rate limiter (more restrictive)
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 AI requests per minute per user
    message: {
        success: false,
        message: 'AI request limit exceeded. Please wait before making more AI requests.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.userId || req.ip;
    },
    handler: (req, res) => {
        console.log(`🤖 AI rate limit exceeded for user ${req.userId || req.ip}`);
        res.status(429).json({
            success: false,
            message: 'AI request limit exceeded. Please wait before making more requests.',
            retryAfter: 60
        });
    }
});

// Create custom rate limiter with specific options
const createLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.userId || req.ip
    };

    return rateLimit({
        ...defaultOptions,
        ...options,
        handler: (req, res) => {
            const message = options.message || {
                success: false,
                message: 'Rate limit exceeded',
                retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
            };

            console.log(`⚠️ Custom rate limit exceeded for ${req.userId || req.ip}`);
            res.status(429).json(message);
        }
    });
};

// Skip rate limiting for certain conditions
const skipSuccessfulRequests = (req, res) => {
    return res.statusCode < 400;
};

const skipFailedRequests = (req, res) => {
    return res.statusCode >= 400;
};

// Export rate limiters
module.exports = defaultRateLimiter;
module.exports.authRateLimiter = authRateLimiter;
module.exports.aiRateLimiter = aiRateLimiter;
module.exports.createLimiter = createLimiter;
module.exports.skipSuccessfulRequests = skipSuccessfulRequests;
module.exports.skipFailedRequests = skipFailedRequests;