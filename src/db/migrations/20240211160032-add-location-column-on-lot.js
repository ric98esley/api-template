'use strict';

const { DataTypes } = require('sequelize');
const { LOT_TABLE } = require('../models/consumable.model/lot.model');
const { LOCATION_TABLE } = require('../models/location.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(LOT_TABLE, 'location_id', {
      allowNull: true,
      type: DataTypes.INTEGER,
      field: 'location_id',
      references: {
        model: LOCATION_TABLE,
        key: 'id'
      },
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * DON'T revert this
     *  Because is a dependency
     *  this migration can be ignore
     *  the implementation is on models->consumables->lot
     */
  }
};
