const { models } = require('../libs/sequelize');

const assetModel = require('./asset.model');
const createdByModel = require('./created_by.model');

const maintenanceModel = {
  include: [
    { ...createdByModel },
    {
      model: models.MaintenanceType,
      as: 'maintenanceType',
      attributes: ['id', 'name'],
    },
    { ...assetModel },
  ],
  attributes: ['id', 'description', 'createdAt', 'updatedAt', 'deletedAt'],
};

module.exports = maintenanceModel;
