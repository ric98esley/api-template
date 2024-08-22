const { models } = require('../libs/sequelize');

const specification = {
  model: models.Specification,
  as: 'specification',
  attributes: ['id', 'name', 'createdAt'],
}

module.exports = specification;