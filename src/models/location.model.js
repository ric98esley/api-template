const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');
const customerModel = require('./customer.model');
const groupModel = require('./group.model');
const locationTypeModel = require('./location_type.model');
const zoneModel = require('./zone.model');

const locationModel = () => {
  const createdBy = createdByModel();
  const group = groupModel();
  const customer = customerModel();
  const zone = zoneModel();
  const locationType = locationTypeModel();

  return {
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
        ...createdBy,
      },
      {
        ...group,
        paranoid: false,
      },
      {
        ...customer,
        paranoid: false,
      },
      {
        ...zone,
        paranoid: false,
      },
      {
        ...locationType,
        paranoid: false,
      },
    ],
  };
};

module.exports = locationModel;
