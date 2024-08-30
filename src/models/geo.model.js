const { models } = require('../libs/sequelize');
const locationModel = require('./location.model');

const geolocationModel = () => {
  return {
    model: models.GeoAsset,
    as: 'geolocation',
    include: [
      locationModel()
    ],
    attributes: ['id', 'ip', 'serial', 'alert', 'alertType', 'latitude', 'longitude', 'createdAt'],
  }
}

module.exports = geolocationModel;