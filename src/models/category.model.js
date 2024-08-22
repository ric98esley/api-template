const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');

const categoryModel = () => ({
  model: models.Category,
  as: 'category',
  include: [{ ...createdByModel() }],
  attributes: ['id', 'name', 'description', 'type', 'createdAt'],
});

module.exports = categoryModel;
