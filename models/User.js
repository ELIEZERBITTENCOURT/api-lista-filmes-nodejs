const Sequelize = require('sequelize');
const db = require('./databaseConnection');

const User = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(200),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(40),
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING(20),
        allowNull: false,
    }
}, {
    timestamps: false
});

//Cria a tabela
User.sync();

module.exports = User;