'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('filme', {
      _id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      titulo: {
          type: Sequelize.STRING(100),
          allowNull: false,
      },
      diretor: {
          type: Sequelize.STRING(140),
          allowNull: false,
      },
      atores: {
          type: Sequelize.STRING(200),
          allowNull: false,
      },
      genero: {
          type: Sequelize.STRING(20),
          allowNull: false,
      },
      descricao: {
          type: Sequelize.STRING(240),
          allowNull: false,
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('filmes');
  }
};