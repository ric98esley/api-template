'use strict';

const { ORDERS_RECORDS_TABLE } = require('../models/orders.model');
const { MOVEMENT_TABLE } = require('../models/orders.model/movement.model');
const { MODEL_TABLE } = require('../models/asset.model/model.model');
const { ASSET_TABLE } = require('../models/asset.model');
const { BRAND_TABLE } = require('../models/brand.model');
const { CATEGORY_TABLE } = require('../models/category.model');
const { LOCATION_TABLE } = require('../models/location.model');
const { USER_TABLE } = require('../models/user.model');
const { GROUP_TABLE } = require('../models/group.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.sequelize.query(`
      CREATE VIEW v_movements as
          SELECT
          ${MOVEMENT_TABLE}.id as id,
            ${ORDERS_RECORDS_TABLE}.id as 'order_id',
            ${ASSET_TABLE}.serial as 'serial',
            ${MODEL_TABLE}.name as 'model',
            ${CATEGORY_TABLE}.name as  'category',
            ${BRAND_TABLE}.name as 'brand',
            desde.id as 'from_id',
            desde.code as 'from_code',
            desde.name as 'from_name',
            para.id as 'to_id',
            para.code as 'to_code',
            para.name as 'to_name',
            ${GROUP_TABLE}.code as 'group_code',
            ${GROUP_TABLE}.name as 'group_name',
            ${ORDERS_RECORDS_TABLE}.type as 'type',
            ${ORDERS_RECORDS_TABLE}.description as 'description',
            ${USER_TABLE}.username as 'created_by',
            ${MOVEMENT_TABLE}.created_at as 'created_at',
            ${MOVEMENT_TABLE}.current as 'current'
            FROM ${MOVEMENT_TABLE}
              left join ${ASSET_TABLE} on ${MOVEMENT_TABLE}.target_id = ${ASSET_TABLE}.id
              left join ${MODEL_TABLE} on ${ASSET_TABLE}.model_id = ${MODEL_TABLE}.id
              left join ${CATEGORY_TABLE} on ${MODEL_TABLE}.category_id = ${CATEGORY_TABLE}.id
              left join ${BRAND_TABLE} on ${MODEL_TABLE}.brand_id = ${BRAND_TABLE}.id
              left join ${ORDERS_RECORDS_TABLE} on ${MOVEMENT_TABLE}.order_id = ${ORDERS_RECORDS_TABLE}.id
              left join ${LOCATION_TABLE} as desde on ${MOVEMENT_TABLE}.from_id = desde.id
              left join ${LOCATION_TABLE} as para on ${MOVEMENT_TABLE}.to_id = para.id
              left join ${GROUP_TABLE} on para.group_id = ${GROUP_TABLE}.id
              left join ${USER_TABLE} on ${MOVEMENT_TABLE}.created_by_id = ${USER_TABLE}.id;
    `)
  },

  async down (queryInterface, Sequelize) {
    queryInterface.sequelize.query(`DROP VIEW v_movements;`);
  }
};
