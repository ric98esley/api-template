const { models } = require('../libs/sequelize');
const brandModel = require('./brand.model');
const categoryModel = require('./category.model');
const createdByModel = require('./created_by.model');
const { include } = require('./location.model');

const modelModel = () => ({
  model: models.Model,
  as: 'model',
  attributes: ['id', 'name', 'createdAt', 'updatedAt'],
  include: [createdByModel(), categoryModel(), brandModel()],
});

module.exports = modelModel;
