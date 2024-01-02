'use strict';

const { ROLE_TABLE, RoleSchema } = require('../models/user.model/role.model.js');
const { PERMISSIONS_TABLE, PermissionSchema } = require('../models/user.model/permissions.model.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ROLE_TABLE, RoleSchema);
    await queryInterface.createTable(PERMISSIONS_TABLE, PermissionSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(PERMISSIONS_TABLE);
    await queryInterface.dropTable(ROLE_TABLE);
  }
};
