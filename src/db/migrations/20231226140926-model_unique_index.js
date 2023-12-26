'use strict';

const { MODEL_TABLE } = require('../models/asset.model/model.model');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      MODEL_TABLE,
      ['name', 'category_id', 'brand_id'],
      {
        name: 'unique_model',
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(MODEL_TABLE, 'unique_model' )
  },
};
