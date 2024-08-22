const { models } = require('../libs/sequelize');

const createdByModel = require("./created_by.model");

const brandModel = () =>({
  model: models.Brand,
  as: 'brand',
  include: [
    {...createdByModel}
  ],
  attributes: [
    'id',
    'name',
    'createdAt',
  ],
});

module.exports = brandModel;
