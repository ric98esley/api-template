'use strict';

const { ABILITY_TABLE, AbilitySchema } = require('../models/user.model/abillities.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ABILITY_TABLE, AbilitySchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(ABILITY_TABLE)
  }
};
