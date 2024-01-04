'use strict';

const {
  ROLE_TABLE,
  RoleSchema,
} = require('../models/user.model/role.model.js');
const {
  PERMISSIONS_TABLE,
  PermissionSchema,
} = require('../models/user.model/permissions.model.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(ROLE_TABLE, RoleSchema);
    await queryInterface.createTable(PERMISSIONS_TABLE, PermissionSchema);
    await queryInterface.addIndex(
      PERMISSIONS_TABLE,
      ['role', 'scope', 'capability', 'possession'],
      {
        unique: true,
        name: 'unique_permission',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeIndex(PERMISSIONS_TABLE, 'unique_permission')
    await queryInterface.dropTable(PERMISSIONS_TABLE);
    await queryInterface.dropTable(ROLE_TABLE);
  },
};
