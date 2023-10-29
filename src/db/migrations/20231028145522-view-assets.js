'use strict';

const { ASSET_TABLE } = require('../models/asset.model');
const { MODEL_TABLE } = require('../models/asset.model/model.model');
const { BRAND_TABLE } = require('../models/brand.model');
const { CATEGORY_TABLE } = require('../models/category.model');
const { GROUP_TABLE } = require('../models/group.model');
const { LOCATION_TABLE } = require('../models/location.model');
const { LOCATION_TYPE_TABLE } = require('../models/location.model/type.model');
const { USER_TABLE } = require('../models/user.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE VIEW v_assets as
        SELECT
          ${ASSET_TABLE}.id as 'id',
          ${ASSET_TABLE}.serial as 'serial',
          ${MODEL_TABLE}.name as 'model',
          ${CATEGORY_TABLE}.name as 'category',
          ${BRAND_TABLE}.name as 'brand',
          ${CATEGORY_TABLE}.type as 'type',
          ${LOCATION_TYPE_TABLE}.status as 'status',
          ${LOCATION_TABLE}.id as 'location_id',
          ${LOCATION_TABLE}.code as 'location_code',
          ${LOCATION_TABLE}.name as 'location',
          ${ASSET_TABLE}.notes as 'notes',
          ${GROUP_TABLE}.id as 'group_id',
          ${GROUP_TABLE}.code as 'group_code',
          ${GROUP_TABLE}.name as 'group_name',
          ${LOCATION_TYPE_TABLE}.name as 'location_type',
          ${USER_TABLE}.username as 'created_by',
          ${ASSET_TABLE}.created_at as 'created_at'
            FROM ${ASSET_TABLE}
              left JOIN ${USER_TABLE} on ${ASSET_TABLE}.created_by_id = ${USER_TABLE}.id
              left JOIN ${MODEL_TABLE} on ${ASSET_TABLE}.model_id = ${MODEL_TABLE}.id
              left JOIN ${CATEGORY_TABLE} on ${MODEL_TABLE}.category_id = ${CATEGORY_TABLE}.id
              left JOIN ${BRAND_TABLE} on ${MODEL_TABLE}.brand_id = ${BRAND_TABLE}.id
              left JOIN ${LOCATION_TABLE} on ${ASSET_TABLE}.location_id = ${LOCATION_TABLE}.id
              left JOIN ${LOCATION_TYPE_TABLE} on ${LOCATION_TABLE}.type_id = ${LOCATION_TYPE_TABLE}.id
              left JOIN ${GROUP_TABLE} on ${LOCATION_TABLE}.group_id = ${GROUP_TABLE}.id;
    `)
  },

  async down (queryInterface, Sequelize) {
    queryInterface.sequelize.query(`DROP VIEW v_assets;`);
  }
};
