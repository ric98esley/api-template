const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const { include } = require('./location.model');

const modelModel = {
  model: models.Model,
  as: 'model',
  attributes: ['id', 'name'],
  include: [
    {...createdByModel},
    {
      model: models.Category,
      as: 'category',
      attributes: ['id', 'name'],
      paranoid: false,
    },
    {
      model: models.Brand,
      as: 'brand',
      attributes: ['id', 'name'],
      paranoid: false,
    },
  ],
};

module.exports = modelModel;
