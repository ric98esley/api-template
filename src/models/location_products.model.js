const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const productModel = require('./product.model');
const locationModel = require('./location.model');


const locationProductsModel = () => {
  return {
    model: models.LocationProducts,
    include: [
      createdByModel(),
      productModel(),
      locationModel(),
    ],
    attributes: ['id', 'quantity', 'min', 'createdAt'],
  };
};

module.exports = locationProductsModel;
