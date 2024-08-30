const { models } = require('../libs/sequelize');
const assetModel = require('./asset.model');
const createdByModel = require('./created_by.model');
const locationModel = require('./location.model');

const movementsModel = () => {
  return {
    model: models.Movement,
    as: 'movements',
    include: [
      {
        ...assetModel(),
        paranoid: false,
        required: true,
      },
      {
        model: models.OrderRecord,
        as: 'order',
        attributes: ['id', 'type', 'description'],
      },
      {
        model: models.Location,
        as: 'from',
        required: false,
        attributes: [...locationModel().attributes],
        include: [...locationModel().include],
      },
      {
        model: models.Location,
        as: 'to',
        required: false,
        attributes: [...locationModel().attributes],
        include: [...locationModel().include],
      },
      {
        ...createdByModel(),
      },
    ],
    attributes: ['id', 'quantity', 'type', 'current', 'createdAt'],
  }
}

module.exports = movementsModel;