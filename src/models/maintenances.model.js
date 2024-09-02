const { models } = require('../libs/sequelize');

const assetModel = require('./asset.model');
const createdByModel = require('./created_by.model');
const maintenanceTypeModel = require('./maintenances_type.model');

const maintenanceModel = () => ({
  include: [
    { ...createdByModel() },
    { ...maintenanceTypeModel() },
    { ...assetModel(), paranoid: false },
  ],
  attributes: ['id', 'description', 'createdAt', 'updatedAt', 'deletedAt'],
});

module.exports = maintenanceModel;
