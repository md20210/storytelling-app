// backend/src/models/Chapter.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define('Chapter', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'book_id',
        references: {
            model: 'books',
            key: 'id'
        }
    },
    chapterNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'chapter_number'
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 500]
        }
    },
    content: {
        type: DataTypes.TEXT
    },
    wordCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'word_count'
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'written', 'reviewed', 'finalized']]
        }
    },
    audioUrl: {
        type: DataTypes.TEXT,
        field: 'audio_url',
        validate: {
            isUrl: true
        }
    },
    audioDuration: {
        type: DataTypes.INTEGER,
        field: 'audio_duration',
        comment: 'Duration in seconds'
    },
    grokEnhanced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'grok_enhanced'
    },
    grokSuggestions: {
        type: DataTypes.TEXT,
        field: 'grok_suggestions',
        comment: 'JSON array of Grok AI suggestions',
        get() {
            const rawValue = this.getDataValue('grokSuggestions');
            if (!rawValue) return [];
            try {
                return JSON.parse(rawValue);
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('grokSuggestions', JSON.stringify(value || []));
        }
    }
}, {
    tableName: 'chapters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['book_id', 'chapter_number']
        }
    ],
    hooks: {
        beforeSave: (chapter) => {
            if (chapter.content) {
                // Calculate word count
                const wordCount = chapter.content
                    .trim()
                    .split(/\s+/)
                    .filter(word => word.length > 0)
                    .length;
                chapter.wordCount = wordCount;
            }
        },
        afterSave: async (chapter) => {
            // Update book statistics
            const Book = require('./Book');
            const book = await Book.findByPk(chapter.bookId);
            if (book) {
                await book.updateStats();
            }
        },
        afterDestroy: async (chapter) => {
            // Update book statistics after deletion
            const Book = require('./Book');
            const book = await Book.findByPk(chapter.bookId);
            if (book) {
                await book.updateStats();
            }
        }
    }
});

// Instance methods
Chapter.prototype.getReadingTime = function() {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const minutes = Math.ceil(this.wordCount / wordsPerMinute);
    return minutes;
};

Chapter.prototype.canBeEditedBy = async function(userId) {
    const Book = require('./Book');
    const book = await Book.findByPk(this.bookId);
    return book && book.userId === userId;
};

Chapter.prototype.addGrokSuggestion = function(suggestion) {
    const suggestions = this.grokSuggestions || [];
    suggestions.push({
        id: Date.now(),
        suggestion,
        timestamp: new Date().toISOString(),
        applied: false
    });
    this.grokSuggestions = suggestions;
};

Chapter.prototype.applySuggestion = function(suggestionId) {
    const suggestions = this.grokSuggestions || [];
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
        suggestion.applied = true;
        this.grokSuggestions = suggestions;
        this.grokEnhanced = true;
    }
};

// Class methods
Chapter.findByBook = async function(bookId, options = {}) {
    const { limit, offset, order } = options;
    
    return await this.findAll({
        where: { bookId },
        limit: limit || 50,
        offset: offset || 0,
        order: order || [['chapter_number', 'ASC']]
    });
};

Chapter.findByBookAndNumber = async function(bookId, chapterNumber) {
    return await this.findOne({
        where: {
            bookId,
            chapterNumber
        }
    });
};

Chapter.getNextChapterNumber = async function(bookId) {
    const lastChapter = await this.findOne({
        where: { bookId },
        order: [['chapter_number', 'DESC']],
        attributes: ['chapter_number']
    });
    
    return (lastChapter?.chapterNumber || 0) + 1;
};

Chapter.createForBook = async function(bookId, chapterData) {
    const { title, content, chapterNumber } = chapterData;
    
    // If no chapter number provided, get the next available
    const finalChapterNumber = chapterNumber || await this.getNextChapterNumber(bookId);
    
    // Check if chapter number already exists
    const existingChapter = await this.findByBookAndNumber(bookId, finalChapterNumber);
    if (existingChapter) {
        throw new Error(`Chapter ${finalChapterNumber} already exists for this book`);
    }
    
    return await this.create({
        bookId,
        chapterNumber: finalChapterNumber,
        title,
        content: content || ''
    });
};

Chapter.updateContent = async function(chapterId, content, userId) {
    const chapter = await this.findByPk(chapterId);
    if (!chapter) {
        throw new Error('Chapter not found');
    }
    
    const canEdit = await chapter.canBeEditedBy(userId);
    if (!canEdit) {
        throw new Error('You do not have permission to edit this chapter');
    }
    
    return await chapter.update({ content });
};

module.exports = Chapter;