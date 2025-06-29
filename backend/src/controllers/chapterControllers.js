// backend/src/controllers/chapterController.js
const Chapter = require('../models/Chapter');
const Book = require('../models/Book');
const grokService = require('../services/grokService');
const { validateChapterTitle, validateContent, validateChapterNumber, validateChapterStatus } = require('../utils/validation');

// Get all chapters for a book
const getChapters = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapters = await Chapter.findByBook(bookId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['chapter_number', 'ASC']]
        });

        console.log(`📝 Retrieved ${chapters.length} chapters for book: ${book.title}`);

        res.json({
            success: true,
            data: {
                chapters,
                bookInfo: {
                    id: book.id,
                    title: book.title,
                    totalChapters: book.totalChapters
                }
            }
        });

    } catch (error) {
        console.error('❌ Get chapters error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve chapters',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single chapter
const getChapter = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        console.log(`📖 Retrieved chapter: ${chapter.title}`);

        res.json({
            success: true,
            data: {
                chapter,
                bookInfo: {
                    id: book.id,
                    title: book.title,
                    language: book.language,
                    genre: book.genre
                }
            }
        });

    } catch (error) {
        console.error('❌ Get chapter error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve chapter',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create new chapter
const createChapter = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, content = '', chapterNumber } = req.body;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Validation
        const titleValidation = validateChapterTitle(title);
        if (!titleValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid title',
                errors: titleValidation.errors
            });
        }

        const contentValidation = validateContent(content, { allowEmpty: true });
        if (!contentValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content',
                errors: contentValidation.errors
            });
        }

        if (chapterNumber) {
            const numberValidation = validateChapterNumber(chapterNumber);
            if (!numberValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid chapter number',
                    errors: numberValidation.errors
                });
            }
        }

        // Create chapter
        const chapter = await Chapter.createForBook(bookId, {
            title: title.trim(),
            content: content.trim(),
            chapterNumber
        });

        console.log(`✅ Created chapter: ${chapter.title} in book: ${book.title}`);

        res.status(201).json({
            success: true,
            message: 'Chapter created successfully',
            data: { chapter }
        });

    } catch (error) {
        console.error('❌ Create chapter error:', error);

        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create chapter',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update chapter
const updateChapter = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const { title, content, status, chapterNumber } = req.body;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        // Validation
        if (title) {
            const titleValidation = validateChapterTitle(title);
            if (!titleValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid title',
                    errors: titleValidation.errors
                });
            }
        }

        if (content !== undefined) {
            const contentValidation = validateContent(content, { allowEmpty: true });
            if (!contentValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content',
                    errors: contentValidation.errors
                });
            }
        }

        if (status) {
            const statusValidation = validateChapterStatus(status);
            if (!statusValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    errors: statusValidation.errors
                });
            }
        }

        if (chapterNumber) {
            const numberValidation = validateChapterNumber(chapterNumber);
            if (!numberValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid chapter number',
                    errors: numberValidation.errors
                });
            }

            // Check if new chapter number conflicts
            if (chapterNumber !== chapter.chapterNumber) {
                const existingChapter = await Chapter.findByBookAndNumber(bookId, chapterNumber);
                if (existingChapter && existingChapter.id !== chapterId) {
                    return res.status(409).json({
                        success: false,
                        message: `Chapter ${chapterNumber} already exists`
                    });
                }
            }
        }

        // Update chapter
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (status) updateData.status = status.toLowerCase();
        if (chapterNumber) updateData.chapterNumber = chapterNumber;

        await chapter.update(updateData);

        console.log(`✅ Updated chapter: ${chapter.title}`);

        res.json({
            success: true,
            message: 'Chapter updated successfully',
            data: { chapter }
        });

    } catch (error) {
        console.error('❌ Update chapter error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update chapter',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete chapter
const deleteChapter = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        const chapterTitle = chapter.title;
        await chapter.destroy();

        console.log(`✅ Deleted chapter: ${chapterTitle}`);

        res.json({
            success: true,
            message: 'Chapter deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete chapter error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete chapter',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Enhance chapter content with Grok AI
const enhanceChapter = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const { enhancementType = 'general' } = req.body;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'AI enhancement service is not available'
            });
        }

        // Get previous chapter for context
        let previousChapter = null;
        if (chapter.chapterNumber > 1) {
            previousChapter = await Chapter.findByBookAndNumber(bookId, chapter.chapterNumber - 1);
        }

        // Enhance content using Grok
        const enhancementResult = await grokService.enhanceChapterContent(
            chapter.title,
            chapter.content,
            {
                bookTitle: book.title,
                genre: book.genre,
                language: book.language,
                previousChapter: previousChapter?.content
            }
        );

        // Update chapter with enhanced content
        await chapter.update({
            content: enhancementResult.enhancedContent,
            grokEnhanced: true
        });

        // Add suggestions to chapter
        if (enhancementResult.suggestions.length > 0) {
            enhancementResult.suggestions.forEach(suggestion => {
                chapter.addGrokSuggestion(suggestion);
            });
            await chapter.save();
        }

        console.log(`✅ Enhanced chapter: ${chapter.title} using Grok AI`);

        res.json({
            success: true,
            message: 'Chapter enhanced successfully',
            data: {
                chapter,
                enhancement: {
                    originalWordCount: chapter.wordCount,
                    newWordCount: enhancementResult.wordCount,
                    suggestions: enhancementResult.suggestions,
                    enhancementType
                }
            }
        });

    } catch (error) {
        console.error('❌ Enhance chapter error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to enhance chapter',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Integrate new thought into chapter
const integrateThought = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const { thought, tone = 'narrative' } = req.body;

        if (!thought || thought.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Thought content is required'
            });
        }

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'AI integration service is not available'
            });
        }

        // Integrate thought using Grok
        const integrationResult = await grokService.integrateNewThought(
            chapter.content,
            thought.trim(),
            {
                language: book.language,
                tone
            }
        );

        // Update chapter with integrated content
        await chapter.update({
            content: integrationResult.integratedContent,
            grokEnhanced: true
        });

        console.log(`✅ Integrated thought into chapter: ${chapter.title}`);

        res.json({
            success: true,
            message: 'Thought integrated successfully',
            data: {
                chapter,
                integration: {
                    originalLength: integrationResult.originalLength,
                    newLength: integrationResult.newLength,
                    addedWords: integrationResult.newLength - integrationResult.originalLength,
                    thought: thought.trim(),
                    tone
                }
            }
        });

    } catch (error) {
        console.error('❌ Integrate thought error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to integrate thought',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate chapter summary
const generateSummary = async (req, res) => {
    try {
        const { bookId, chapterId } = req.params;
        const { length = 'medium' } = req.body;

        // Verify user owns the book
        const book = await Book.findByUserAndId(req.userId, bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const chapter = await Chapter.findOne({
            where: {
                id: chapterId,
                bookId: bookId
            }
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found'
            });
        }

        if (!chapter.content || chapter.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot generate summary for empty chapter'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'AI summary service is not available'
            });
        }

        // Generate summary using Grok
        const summaryResult = await grokService.generateChapterSummary(chapter.content, {
            language: book.language,
            length
        });

        console.log(`✅ Generated summary for chapter: ${chapter.title}`);

        res.json({
            success: true,
            message: 'Chapter summary generated successfully',
            data: {
                summary: summaryResult.summary,
                chapterInfo: {
                    title: chapter.title,
                    chapterNumber: chapter.chapterNumber,
                    originalWordCount: summaryResult.originalWordCount,
                    summaryWordCount: summaryResult.summaryWordCount
                },
                length
            }
        });

    } catch (error) {
        console.error('❌ Generate summary error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getChapters,
    getChapter,
    createChapter,
    updateChapter,
    deleteChapter,
    enhanceChapter,
    integrateThought,
    generateSummary
};