// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const config = {
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
};

// Initialize Sequelize
let sequelize;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL
    sequelize = new Sequelize(process.env.DATABASE_URL, config);
    console.log('📊 Using DATABASE_URL for connection');
} else {
    // Fallback to individual environment variables
    sequelize = new Sequelize(
        process.env.DB_NAME || 'storytelling_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'password',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            ...config
        }
    );
    console.log('📊 Using individual DB environment variables');
}

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Database server is not running or connection was refused');
        } else if (error.message.includes('authentication failed')) {
            console.error('💡 Database authentication failed. Check username/password');
        } else if (error.message.includes('does not exist')) {
            console.error('💡 Database does not exist. Create it first');
        }
        
        return false;
    }
};

// Initialize database with retry logic
const initializeDatabase = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        console.log(`🔄 Database connection attempt ${attempt}/${retries}`);
        
        const connected = await testConnection();
        if (connected) {
            return sequelize;
        }
        
        if (attempt < retries) {
            console.log(`⏳ Retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    throw new Error('Failed to connect to database after multiple attempts');
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;