'use strict';

const { GEO_ASSET_TABLE } = require('../models/asset.model/geo-assets.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(GEO_ASSET_TABLE, 'latitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });

    await queryInterface.changeColumn(GEO_ASSET_TABLE, 'longitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(GEO_ASSET_TABLE, 'latitude', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });

    await queryInterface.changeColumn(GEO_ASSET_TABLE, 'longitude', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });
  }
};
