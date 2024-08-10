'use strict';

const { GEO_ASSET_TABLE } = require('../models/asset.model/geo-assets.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(GEO_ASSET_TABLE, 'location_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
