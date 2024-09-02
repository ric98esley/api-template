const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const locationModel = require('./location.model');
const modelModel = require('./model.model');

const assetModel = (showLocation = true) => {
  const include = [
    { ...createdByModel(), paranoid: false },
    { ...modelModel(), paranoid: false },
  ];

  if (showLocation) {
    include.push({ ...locationModel(), paranoid: false });
  }
  return {
    model: models.Asset,
    as: 'asset',
    include,
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
