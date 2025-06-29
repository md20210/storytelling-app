// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
    },
    firstName: {
        type: DataTypes.STRING(100),
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        field: 'last_name'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
                user.passwordHash = await bcrypt.hash(user.password, saltRounds);
                delete user.password;
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
                user.passwordHash = await bcrypt.hash(user.password, saltRounds);
                delete user.password;
            }
        }
    }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

User.prototype.getFullName = function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
};

User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
};

// Class methods
User.findByEmail = async function(email) {
    return await this.findOne({
        where: { 
            email: email.toLowerCase(),
            isActive: true 
        }
    });
};

User.createUser = async function(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    
    return await this.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName
    });
};

module.exports = User;