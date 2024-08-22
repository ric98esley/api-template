const { models } = require('../libs/sequelize');

const assetSpecModel = () => ({
  model: models.AssetSpec,
  as: 'specifications',
  include: [
    {
      model: models.HardwareSpec,
      as: 'type',
      attributes: ['id', 'name'],
    },
  ],
  attributes: ['id', 'value', 'typeId', 'createdAt'],
});

module.exports = assetSpecModel;
