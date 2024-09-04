const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const locationModel = require('./location.model');

const lotModel = () => {
  return {
    model: models.Lot,
    as: 'lot',
    include: [createdByModel(), locationModel()],
  };
};

module.exports = lotModel;
