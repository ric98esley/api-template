'use strict';

const { SESSION_TABLE, SessionSchema } = require('../models/user.model/sessions.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(SESSION_TABLE, SessionSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(SESSION_TABLE);
  }
};
