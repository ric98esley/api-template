const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const locationModel = require('./location.model');
const modelModel = require('./model.model');

const assetModel = {
  model: models.Asset,
  as: 'asset',
  include: [{ ...createdByModel }, { ...locationModel, paranoid: false }, { ...modelModel, paranoid: false }],
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

module.exports = assetModel;
