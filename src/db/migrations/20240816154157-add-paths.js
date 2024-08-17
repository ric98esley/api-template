'use strict';

const { PATHS_RECORDS_TABLE, PathRecordSchema } = require('../models/paths.model/paths.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(PATHS_RECORDS_TABLE, PathRecordSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(PATHS_RECORDS_TABLE)
  }
};
