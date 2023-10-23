'use strict';

const { LOCATION_TABLE, LocationSchema } = require('../models/location.model');
const { LOCATION_TYPE_TABLE, LocationTypeSchema } = require('../models/location.model/type.model');
const { ZONE_TABLE, ZoneSchema } = require('../models/location.model/zone.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ZONE_TABLE, ZoneSchema);
    await queryInterface.createTable(LOCATION_TYPE_TABLE, LocationTypeSchema);
    await queryInterface.createTable(LOCATION_TABLE, LocationSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(LOCATION_TABLE);
    await queryInterface.dropTable(LOCATION_TYPE_TABLE);
    await queryInterface.dropTable(ZONE_TABLE);
  }
};
