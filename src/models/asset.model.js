const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const locationModel = require('./location.model');
const modelModel = require('./model.model');

const assetModel = () => {
  const createdBy = createdByModel();
  const location = locationModel();
  const model = modelModel();
  return {
    model: models.Asset,
    as: 'asset',
    include: [
      { ...createdBy, paranoid: false },
      { ...location, paranoid: false },
      // { ...model, paranoid: false },
    ],
    attributes: [
      'id',
      'serial',
      'notes',
      'countChecking',
      'enabled',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ],
  };
};

module.exports = assetModel;
