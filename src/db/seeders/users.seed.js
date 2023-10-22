const bcrypt = require('bcrypt');
const { USER_TABLE } = require('./../models/user.model');
const { ROLES } = require('../../utils/roles');

module.exports = {
  up: async (queryInterface) => {
    if (queryInterface.context) {
      queryInterface = queryInterface.context;
    }
    return queryInterface.bulkInsert(USER_TABLE, [
      {
        username: 'superuser',
        email: 'admin@mail.com',
        password: 'admin123',
        role: ROLES.SUPERUSER,
        created_at: new Date()
      },
      {
        username: 'cliente1',
        email: 'customer@mail.com',
        password: 'customer123',
        role: ROLES.CUSTOMER,
        created_at: new Date()
      }
    ]);
  },
  down: (queryInterface) => {
    if (queryInterface.context) {
      queryInterface = queryInterface.context;
    }
    return queryInterface.bulkDelete(USER_TABLE, null, {});
  }
};