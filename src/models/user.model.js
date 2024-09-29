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
    'isActive',
    'role',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ],
  include: [{ ...customerModel(), as: 'profile' }, groupModel()],
});

module.exports = userModel;
