'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('abilities', ['role_id', 'resource', 'action', 'scope'], {
      unique: true,
      name: 'resource_action_scope_unique_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('abilities', 'resource_action_scope_unique_idx');
  }
};
