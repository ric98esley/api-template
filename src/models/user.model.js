const { models } = require('../libs/sequelize');

const customerModel = require('./customer.model');
const groupModel = require('./group.model');

const userModel = () => ({
  model: models.User,
  as: 'user',
  attributes: [
    'id',
    'username',
    'email',
    'role',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ],
  include: [
    customerModel(),
    {
      ...groupModel(),
    },
  ],
});

module.exports = userModel;
