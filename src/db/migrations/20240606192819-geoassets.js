'use strict';

const {
  GEO_ASSET_TABLE,
  GeoAssetSchema,
} = require('../models/asset.model/geo-assets.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(GEO_ASSET_TABLE, GeoAssetSchema);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(GEO_ASSET_TABLE);
  },
};
