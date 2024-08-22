const { models } = require('../libs/sequelize');

const specificationModel = () =>({
  model: models.Specification,
  as: 'specification',
  attributes: ['id', 'name', 'createdAt'],
})

module.exports = specificationModel;