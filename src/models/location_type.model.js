const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const { include } = require('./group.model');

const locationTypeModel = () => ({
  model: models.LocationType,
  as: 'type',
  attributes: ['id', 'name', 'status', 'createdAt'],
  include: [{ ...createdByModel() }],
});

module.exports = locationTypeModel;
