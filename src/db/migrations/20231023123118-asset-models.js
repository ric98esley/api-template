'use strict';

const { ASSET_TABLE, AssetSchema } = require('../models/asset.model');
const { ASSET_SPEC_TABLE, AssetSpecSchema } = require('../models/asset.model/assetSpec.model');
const { MODEL_TABLE, ModelSchema } = require('../models/asset.model/model.model');
const { HARDWARE_SPEC_TABLE, HardwareSpecSchema } = require('../models/asset.model/specification.model');
const { BRAND_TABLE, BrandSchema } = require('../models/brand.model');
const { CATEGORY_TABLE, CategorySchema } = require('../models/category.model');
const { CATEGORY_SPEC_TABLE, CategorySpecSchema } = require('../models/category.model/categorySpec.model');
const { WAREHOUSE_TABLE, WarehouseSchema } = require('../models/warehouse.model');
const { LOCATION_PRODUCTS_TABLE, LocationProductsSchema } = require('../models/warehouse.model/locationProducts.model');
const { WAREHOUSE_PRODUCTS_TABLE, WarehouseProductsSchema } = require('../models/warehouse.model/warehouseProducts');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(WAREHOUSE_TABLE, WarehouseSchema);
    await queryInterface.createTable(CATEGORY_TABLE, CategorySchema);
    await queryInterface.createTable(BRAND_TABLE, BrandSchema);
    await queryInterface.createTable(MODEL_TABLE, ModelSchema);
    await queryInterface.createTable(ASSET_TABLE, AssetSchema);
    await queryInterface.createTable(HARDWARE_SPEC_TABLE, HardwareSpecSchema);
    await queryInterface.createTable(CATEGORY_SPEC_TABLE, CategorySpecSchema);
    await queryInterface.createTable(ASSET_SPEC_TABLE, AssetSpecSchema);
    await queryInterface.createTable(WAREHOUSE_PRODUCTS_TABLE, WarehouseProductsSchema);
    await queryInterface.createTable(LOCATION_PRODUCTS_TABLE, LocationProductsSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(LOCATION_PRODUCTS_TABLE);
    await queryInterface.dropTable(WAREHOUSE_PRODUCTS_TABLE);
    await queryInterface.dropTable(ASSET_SPEC_TABLE);
    await queryInterface.dropTable(CATEGORY_SPEC_TABLE);
    await queryInterface.dropTable(HARDWARE_SPEC_TABLE);
    await queryInterface.dropTable(ASSET_TABLE);
    await queryInterface.dropTable(MODEL_TABLE);
    await queryInterface.dropTable(BRAND_TABLE);
    await queryInterface.dropTable(CATEGORY_TABLE);
    await queryInterface.dropTable(WAREHOUSE_TABLE);
  }
};
