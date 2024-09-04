const { models } = require('../libs/sequelize');
const lotModel = require('./lot.model');
const productModel = require('./product.model');

const productHistoryModel = () => {
  return {
    model: models.ProductHistory,
    as: 'movements',
    attributes: ['id', 'quantity', 'createdAt'],
    include: [
      {
        model: models.LocationProducts,
        as: 'target',
        attributes: ['id', 'quantity', 'min', 'createdAt'],
        include: [{ ...productModel(), paranoid: false }],
      },
      lotModel(),
    ],
  };
};

module.exports = productHistoryModel;
