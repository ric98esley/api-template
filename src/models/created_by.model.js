const { models } = require('../libs/sequelize');

const createdByModel = {
  model: models.User,
  as: 'createdBy',
  paranoid: false,
  attributes: ['id', 'username', 'email'],
}

module.exports = createdByModel;