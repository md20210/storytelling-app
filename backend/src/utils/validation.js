// backend/src/utils/validation.js

// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
const validatePassword = (password) => {
    const errors = [];
    const isValid = true;

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Optional: Special character requirement
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //     errors.push('Password must contain at least one special character');
    // }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Book title validation
const validateBookTitle = (title) => {
    const errors = [];

    if (!title || title.trim().length === 0) {
        errors.push('Book title is required');
        return { isValid: false, errors };
    }

    if (title.length > 500) {
        errors.push('Book title must be less than 500 characters');
    }

    if (title.trim().length < 2) {
        errors.push('Book title must be at least 2 characters long');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Chapter title validation
const validateChapterTitle = (title) => {
    const errors = [];

    if (!title || title.trim().length === 0) {
        errors.push('Chapter title is required');
        return { isValid: false, errors };
    }

    if (title.length > 500) {
        errors.push('Chapter title must be less than 500 characters');
    }

    if (title.trim().length < 2) {
        errors.push('Chapter title must be at least 2 characters long');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Content validation
const validateContent = (content, options = {}) => {
    const { maxLength = 100000, allowEmpty = true } = options;
    const errors = [];

    if (!allowEmpty && (!content || content.trim().length === 0)) {
        errors.push('Content cannot be empty');
        return { isValid: false, errors };
    }

    if (content && content.length > maxLength) {
        errors.push(`Content must be less than ${maxLength} characters`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Genre validation
const validateGenre = (genre) => {
    const validGenres = [
        'fiction',
        'non-fiction',
        'mystery',
        'romance',
        'science-fiction',
        'fantasy',
        'thriller',
        'horror',
        'biography',
        'autobiography',
        'history',
        'travel',
        'self-help',
        'business',
        'poetry',
        'drama',
        'comedy',
        'adventure',
        'children',
        'young-adult',
        'other'
    ];

    if (genre && !validGenres.includes(genre.toLowerCase())) {
        return {
            isValid: false,
            errors: [`Genre must be one of: ${validGenres.join(', ')}`]
        };
    }

    return { isValid: true, errors: [] };
};

// Language validation
const validateLanguage = (language) => {
    const validLanguages = ['en', 'de', 'es', 'fr', 'it'];

    if (language && !validLanguages.includes(language.toLowerCase())) {
        return {
            isValid: false,
            errors: [`Language must be one of: ${validLanguages.join(', ')}`]
        };
    }

    return { isValid: true, errors: [] };
};

// Status validation
const validateBookStatus = (status) => {
    const validStatuses = ['draft', 'in_progress', 'completed', 'published'];

    if (status && !validStatuses.includes(status.toLowerCase())) {
        return {
            isValid: false,
            errors: [`Status must be one of: ${validStatuses.join(', ')}`]
        };
    }

    return { isValid: true, errors: [] };
};

const validateChapterStatus = (status) => {
    const validStatuses = ['draft', 'written', 'reviewed', 'finalized'];

    if (status && !validStatuses.includes(status.toLowerCase())) {
        return {
            isValid: false,
            errors: [`Status must be one of: ${validStatuses.join(', ')}`]
        };
    }

    return { isValid: true, errors: [] };
};

// Chapter number validation
const validateChapterNumber = (chapterNumber) => {
    const errors = [];

    if (chapterNumber === undefined || chapterNumber === null) {
        errors.push('Chapter number is required');
        return { isValid: false, errors };
    }

    const num = parseInt(chapterNumber);
    
    if (isNaN(num)) {
        errors.push('Chapter number must be a valid number');
    } else if (num < 1) {
        errors.push('Chapter number must be greater than 0');
    } else if (num > 9999) {
        errors.push('Chapter number must be less than 10000');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Sanitize input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .substring(0, 10000); // Limit length for safety
};

// Name validation (for firstName, lastName)
const validateName = (name, fieldName = 'Name') => {
    const errors = [];

    if (name && name.length > 100) {
        errors.push(`${fieldName} must be less than 100 characters`);
    }

    if (name && !/^[a-zA-ZÀ-ÿ\s'-]*$/.test(name)) {
        errors.push(`${fieldName} contains invalid characters`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateBookTitle,
    validateChapterTitle,
    validateContent,
    validateGenre,
    validateLanguage,
    validateBookStatus,
    validateChapterStatus,
    validateChapterNumber,
    validateName,
    sanitizeInput
};