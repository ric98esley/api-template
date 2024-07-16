'use strict';

const {
  MAINTENANCES_TYPE_TABLE,
  MaintenanceTypeSchema,
} = require('../models/maintecentes/maintenance_types');
const {
  MaintenanceSchema,
  MAINTENANCES_TABLE,
} = require('../models/maintecentes/maintenances');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(MAINTENANCES_TYPE_TABLE, MaintenanceTypeSchema);
    await queryInterface.createTable(MAINTENANCES_TABLE, MaintenanceSchema);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(MAINTENANCES_TABLE);
    await queryInterface.dropTable(MAINTENANCES_TYPE_TABLE);
  },
};
