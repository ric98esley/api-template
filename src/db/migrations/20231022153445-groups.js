'use strict';

const { GROUP_TABLE, GroupSchema } = require('../models/group.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(GROUP_TABLE, GroupSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(GROUP_TABLE);
  }
};
