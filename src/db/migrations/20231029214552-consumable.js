'use strict';

const { PRODUCT_TABLE, ProductSchema } = require('../models/consumable.model');
const { LOCATION_PRODUCTS_TABLE, LocationProductsSchema } = require('../models/warehouse.model/locationProducts.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(PRODUCT_TABLE, ProductSchema);
    await queryInterface.createTable(LOCATION_PRODUCTS_TABLE, LocationProductsSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(LOCATION_PRODUCTS_TABLE);
    await queryInterface.dropTable(PRODUCT_TABLE);
  }
};
