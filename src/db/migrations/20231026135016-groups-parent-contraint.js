'use strict';

const { GROUP_TABLE } = require('../models/group.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint(GROUP_TABLE, {
      fields: ['parent_id'],
      type: 'foreign key',
      references: {
        table: GROUP_TABLE,
        field: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      name: 'parent_id_fkey',
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint(GROUP_TABLE, 'parent_id_fkey')
  }
};
