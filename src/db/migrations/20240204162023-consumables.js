'use strict';

const { PRODUCT_TABLE, ProductSchema } = require('../models/consumable.model');
const { PRODUCT_HISTORY, ProductHistorySchema } = require('../models/consumable.model/history.model');
const { LOT_TABLE, LotSchema } = require('../models/consumable.model/lot.model');
const { LOCATION_PRODUCTS_TABLE, LocationProductsSchema } = require('../models/warehouse.model/locationProducts.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(LOT_TABLE, LotSchema);
    await queryInterface.createTable(PRODUCT_HISTORY, ProductHistorySchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(PRODUCT_HISTORY);
    await queryInterface.dropTable(LOT_TABLE);
  }
};
