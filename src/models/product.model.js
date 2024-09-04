const { models } = require('../libs/sequelize');
const categoryModel = require('./category.model');
const createdByModel = require('./created_by.model');

const productModel = () => {
  return {
    model: models.Product,
    as: 'product',
    include: [createdByModel(), categoryModel()],
    attributes: [
      'id',
      'name',
      'code',
      'price',
      'unit',
      'description',
      'createdAt',
    ],
  };
};

module.exports = productModel;
