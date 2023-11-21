'use strict';

const { DataTypes } = require('sequelize');
const { ASSET_TABLE } = require('../models/asset.model');
const { SETTINGS_TABLE, SettingSchema } = require('../models/settings.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(SETTINGS_TABLE, SettingSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(SETTINGS_TABLE)
  }
};
