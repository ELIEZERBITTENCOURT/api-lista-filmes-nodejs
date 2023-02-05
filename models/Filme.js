const Sequelize = require('sequelize');
const db = require('./databaseConnection');

const Filme = db.define('filme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    director: {
        type: Sequelize.STRING
    },
    actors: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    },
    genres: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    },
    votes: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
    },
    averageVote: {
        type: Sequelize.FLOAT
    }
}); 

Filme.sync();

module.exports = Filme;