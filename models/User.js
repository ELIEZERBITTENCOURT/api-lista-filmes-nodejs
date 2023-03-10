const Sequelize = require('sequelize');
const db = require('./databaseConnection');

const User = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.ENUM,
        values: ['user', 'admin']
    },
    isActive: {
        type: Sequelize.BOOLEAN
    }
});

User.sync();

module.exports = User;