'use strict';

const { USER_TABLE, UserSchema } = require('../models/user.model');
const { ATTEMPT_TABLE, AttemptSchema } = require('../models/user.model/attempt.model');
const { COSTUMER_TABLE, CostumerSchema } = require('../models/user.model/costumer.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(COSTUMER_TABLE, CostumerSchema);
    await queryInterface.createTable(USER_TABLE, UserSchema);
    await queryInterface.createTable(ATTEMPT_TABLE, AttemptSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(ATTEMPT_TABLE);
    await queryInterface.dropTable(USER_TABLE);
    await queryInterface.dropTable(COSTUMER_TABLE);
  }
};
