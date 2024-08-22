const { models } = require('../libs/sequelize');

const customerModel = () => ({
  model: models.Customer,
  as: 'manager',
  attributes: ['id', 'name', 'lastName', 'phone', 'createdAt'],
});

module.exports = customerModel;
