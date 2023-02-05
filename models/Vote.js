const Sequelize = require('sequelize');
const db = require('./databaseConnection');

const Vote = db.define('votes', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.STRING
    },
    movieId: {
        type: Sequelize.STRING
    },
    vote: {
        type: Sequelize.INTEGER
    }
});

Vote.sync();

module.exports = Vote;