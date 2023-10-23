'use strict';

const { ORDERS_RECORDS_TABLE, OrderRecordSchema } = require('../models/orders.model');
const { MOVEMENT_TABLE, MovementSchema } = require('../models/orders.model/movement.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ORDERS_RECORDS_TABLE, OrderRecordSchema),
    await queryInterface.createTable(MOVEMENT_TABLE, MovementSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(MOVEMENT_TABLE, MovementSchema);
    await queryInterface.dropTable(ORDERS_RECORDS_TABLE, OrderRecordSchema)
  }
};
