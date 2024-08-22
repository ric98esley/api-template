const { models } = require('../libs/sequelize');

const locationModel = {
  model: models.Location,
  as: 'location',
  attributes: [
    'id',
    'code',
    'isActive',
    'name',
    'phone',
    'rif',
    'address',
    'createdAt',
  ],
  include: [
    {
      model: models.User,
      as: 'createdBy',
      attributes: ['id', 'username', 'email'],
    },
    {
      model: models.Group,
      as: 'group',
      attributes: ['id', 'name', 'code'],
    },
    {
      model: models.Customer,
      as: 'manager',
      attributes: ['id', 'name', 'lastName'],
    },
    {
      model: models.Zone,
      as: 'zone',
      attributes: ['id', 'name'],
    },
    {
      model: models.LocationType,
      as: 'type',
      attributes: ['id', 'name', 'status'],
    },
  ]
}

module.exports = locationModel;