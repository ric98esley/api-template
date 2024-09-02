const { models } = require('../libs/sequelize');

const maintenanceTypeModel = () => ({
  model: models.MaintenanceType,
  as: 'maintenanceType',
  attributes: ['id', 'name', 'description'],
});

module.exports = maintenanceTypeModel;