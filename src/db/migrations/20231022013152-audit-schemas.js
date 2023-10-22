'use strict';

const { LOG_TABLE, LogSchema } = require('../models/log.model');
const { PARANOID_TABLE, ParanoidSchema } = require('../models/log.model/paranoid.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(LOG_TABLE, LogSchema);
    await queryInterface.createTable(PARANOID_TABLE, ParanoidSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(LOG_TABLE);
  }
};
