// backend/src/models/Book.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 500]
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    genre: {
        type: DataTypes.STRING(100)
    },
    language: {
        type: DataTypes.STRING(10),
        defaultValue: 'en',
        validate: {
            isIn: [['en', 'de', 'es', 'fr', 'it']]
        }
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'in_progress', 'completed', 'published']]
        }
    },
    totalChapters: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_chapters'
    },
    totalWords: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_words'
    },
    coverImageUrl: {
        type: DataTypes.TEXT,
        field: 'cover_image_url',
        validate: {
            isUrl: true
        }
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_public'
    },
    grokEnhanced: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'grok_enhanced'
    }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance methods
Book.prototype.updateStats = async function() {
    const Chapter = require('./Chapter');
    
    const stats = await Chapter.findAll({
        where: { bookId: this.id },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'chapterCount'],
            [sequelize.fn('SUM', sequelize.col('word_count')), 'totalWords']
        ],
        raw: true
    });
    
    const chapterCount = parseInt(stats[0]?.chapterCount) || 0;
    const totalWords = parseInt(stats[0]?.totalWords) || 0;
    
    await this.update({
        totalChapters: chapterCount,
        totalWords: totalWords
    });
    
    return { totalChapters: chapterCount, totalWords };
};

Book.prototype.getProgress = function() {
    if (this.totalChapters === 0) return 0;
    
    // Calculate progress based on chapters with content
    // This will be enhanced when we add chapter completion tracking
    switch (this.status) {
        case 'draft': return 10;
        case 'in_progress': return 50;
        case 'completed': return 100;
        case 'published': return 100;
        default: return 0;
    }
};

Book.prototype.canBeEditedBy = function(userId) {
    return this.userId === userId;
};

// Class methods
Book.findByUser = async function(userId, options = {}) {
    const { status, limit, offset, order } = options;
    
    const whereClause = { userId };
    if (status) {
        whereClause.status = status;
    }
    
    return await this.findAll({
        where: whereClause,
        limit: limit || 50,
        offset: offset || 0,
        order: order || [['updated_at', 'DESC']],
        include: options.includeChapters ? [{
            model: require('./Chapter'),
            as: 'chapters'
        }] : []
    });
};

Book.findByUserAndId = async function(userId, bookId) {
    return await this.findOne({
        where: {
            id: bookId,
            userId: userId
        }
    });
};

Book.createForUser = async function(userId, bookData) {
    const { title, description, genre, language } = bookData;
    
    return await this.create({
        userId,
        title,
        description,
        genre,
        language: language || 'en'
    });
};

module.exports = Book;