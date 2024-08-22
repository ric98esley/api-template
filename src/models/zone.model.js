const { models } = require('../libs/sequelize');

const zoneModel = () => ({
  model: models.Zone,
  as: 'zone',
  attributes: ['id', 'name', 'createdAt'],
});

module.exports = zoneModel;
