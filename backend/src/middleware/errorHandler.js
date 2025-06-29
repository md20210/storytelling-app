// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('💥 Error Handler:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        userId: req.userId,
        timestamp: new Date().toISOString()
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(error => error.message).join(', ');
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message,
                value: e.value
            }))
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            error: 'Duplicate entry'
        });
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid reference to related resource',
            error: 'Foreign key constraint violation'
        });
    }

    // Sequelize database connection error
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            message: 'Database connection error',
            error: 'Service temporarily unavailable'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'Authentication failed'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            error: 'Authentication failed'
        });
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large',
            error: 'File size exceeds limit'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected file field',
            error: 'Invalid file upload'
        });
    }

    // Cast error (invalid ObjectId for MongoDB, invalid UUID for PostgreSQL)
    if (err.name === 'CastError' || err.message.includes('invalid input syntax for type uuid')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: 'Bad request'
        });
    }

    // Axios/HTTP errors (for external API calls like Grok)
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'External service unavailable',
            error: 'Service connection failed'
        });
    }

    if (err.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'External service not found',
            error: 'DNS resolution failed'
        });
    }

    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
        return res.status(504).json({
            success: false,
            message: 'Request timeout',
            error: 'External service timeout'
        });
    }

    // Rate limiting error
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests',
            error: 'Rate limit exceeded',
            retryAfter: err.retryAfter || 60
        });
    }

    // Grok API specific errors
    if (err.message && err.message.includes('Grok API')) {
        return res.status(503).json({
            success: false,
            message: 'AI service error',
            error: err.message
        });
    }

    // Default to 500 server error
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal Server Error' : message,
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            name: err.name
        } : undefined,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    });
};

// 404 handler (should be used before error handler)
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// Async error wrapper to catch async errors in routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.asyncHandler = asyncHandler;