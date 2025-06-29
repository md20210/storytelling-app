// backend/src/controllers/bookController.js
const Book = require('../models/Book');
const Chapter = require('../models/Chapter');
const grokService = require('../services/grokService');
const { validateBookTitle, validateGenre, validateLanguage, validateBookStatus } = require('../utils/validation');

// Get all books for current user
const getBooks = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0, search } = req.query;
        
        const options = {
            status,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['updated_at', 'DESC']]
        };

        let books = await Book.findByUser(req.userId, options);

        // Apply search filter if provided
        if (search) {
            const searchTerm = search.toLowerCase();
            books = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.description?.toLowerCase().includes(searchTerm) ||
                book.genre?.toLowerCase().includes(searchTerm)
            );
        }

        // Get total count for pagination
        const totalBooks = await Book.count({
            where: { userId: req.userId }
        });

        console.log(`📚 Retrieved ${books.length} books for user ${req.userId}`);

        res.json({
            success: true,
            data: {
                books,
                pagination: {
                    total: totalBooks,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + books.length) < totalBooks
                }
            }
        });

    } catch (error) {
        console.error('❌ Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve books',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single book by ID
const getBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { includeChapters = true } = req.query;

        const book = await Book.findByUserAndId(req.userId, bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        let bookData = book.toJSON();

        // Include chapters if requested
        if (includeChapters) {
            const chapters = await Chapter.findByBook(bookId, {
                order: [['chapter_number', 'ASC']]
            });
            bookData.chapters = chapters;
        }

        console.log(`📖 Retrieved book: ${book.title}`);

        res.json({
            success: true,
            data: { book: bookData }
        });

    } catch (error) {
        console.error('❌ Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve book',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create new book
const createBook = async (req, res) => {
    try {
        const { title, description, genre, language = 'en' } = req.body;

        // Validation
        const titleValidation = validateBookTitle(title);
        if (!titleValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid title',
                errors: titleValidation.errors
            });
        }

        const genreValidation = validateGenre(genre);
        if (!genreValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid genre',
                errors: genreValidation.errors
            });
        }

        const languageValidation = validateLanguage(language);
        if (!languageValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language',
                errors: languageValidation.errors
            });
        }

        // Create book
        const book = await Book.createForUser(req.userId, {
            title: title.trim(),
            description: description?.trim(),
            genre: genre?.toLowerCase(),
            language: language.toLowerCase()
        });

        console.log(`✅ Created book: ${book.title} for user ${req.userId}`);

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: { book }
        });

    } catch (error) {
        console.error('❌ Create book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update book
const updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, description, genre, language, status } = req.body;

        const book = await Book.findByUserAndId(req.userId, bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Validation
        if (title) {
            const titleValidation = validateBookTitle(title);
            if (!titleValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid title',
                    errors: titleValidation.errors
                });
            }
        }

        if (genre) {
            const genreValidation = validateGenre(genre);
            if (!genreValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid genre',
                    errors: genreValidation.errors
                });
            }
        }

        if (language) {
            const languageValidation = validateLanguage(language);
            if (!languageValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid language',
                    errors: languageValidation.errors
                });
            }
        }

        if (status) {
            const statusValidation = validateBookStatus(status);
            if (!statusValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    errors: statusValidation.errors
                });
            }
        }

        // Update book
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (genre) updateData.genre = genre.toLowerCase();
        if (language) updateData.language = language.toLowerCase();
        if (status) updateData.status = status.toLowerCase();

        await book.update(updateData);

        console.log(`✅ Updated book: ${book.title}`);

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: { book }
        });

    } catch (error) {
        console.error('❌ Update book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete book
const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findByUserAndId(req.userId, bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const bookTitle = book.title;
        await book.destroy();

        console.log(`✅ Deleted book: ${bookTitle}`);

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate book summary with Grok AI
const generateBookSummary = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { summaryType = 'email' } = req.body;

        const book = await Book.findByUserAndId(req.userId, bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Get all chapters
        const chapters = await Chapter.findByBook(bookId, {
            order: [['chapter_number', 'ASC']]
        });

        if (chapters.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate summary for book with no chapters'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'AI summary service is not available'
            });
        }

        // Generate summary using Grok
        const summaryResult = await grokService.generateBookSummary(chapters, {
            title: book.title,
            genre: book.genre,
            language: book.language
        });

        console.log(`✅ Generated ${summaryType} summary for book: ${book.title}`);

        res.json({
            success: true,
            message: 'Book summary generated successfully',
            data: {
                summary: summaryResult.emailSummary,
                bookInfo: {
                    title: book.title,
                    chapterCount: chapters.length,
                    totalWords: summaryResult.totalWords,
                    genre: book.genre,
                    language: book.language
                },
                summaryType
            }
        });

    } catch (error) {
        console.error('❌ Generate book summary error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate book summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get book statistics
const getBookStats = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findByUserAndId(req.userId, bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Get detailed chapter statistics
        const chapters = await Chapter.findByBook(bookId);
        
        const stats = {
            totalChapters: book.totalChapters,
            totalWords: book.totalWords,
            averageWordsPerChapter: chapters.length > 0 ? Math.round(book.totalWords / chapters.length) : 0,
            estimatedReadingTime: Math.ceil(book.totalWords / 200), // 200 words per minute
            progress: book.getProgress(),
            status: book.status,
            lastUpdated: book.updatedAt,
            chapterBreakdown: chapters.map(ch => ({
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                wordCount: ch.wordCount,
                status: ch.status,
                readingTime: ch.getReadingTime()
            }))
        };

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('❌ Get book stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get book statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    generateBookSummary,
    getBookStats
};