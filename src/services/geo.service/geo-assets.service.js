const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');
const geolocationModel = require('../../models/geo.model');

const mapGeo = (data) => {
  return {
    id: data.id,
    ip: data.ip,
    serial: data.serial,
    alert: data.alert,
    alertType: data.alertType,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.createdAt,
    location: data.location,
  };
};

class GeoAssetServices {
  async create({
    ip,
    serial,
    alert,
    alertType,
    latitude,
    longitude,
    locationId,
  }) {
    const geoAsset = await models.GeoAsset.create({
      ip,
      serial,
      alert,
      alertType,
      locationId,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    return mapGeo(geoAsset);
  }

  async find({
    ip,
    serial,
    alert,
    alertType,
    location,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
    }
    if (!isNaN(endDate)) {
      endDate = Number(endDate);
    }

    const where = {};

    if (ip) where.ip = { [Op.like]: `%${ip}%` };
    if (serial) where.serial = { [Op.like]: `%${serial}%` };
    if (alert) where.alert = alert;
    if (alertType) where.alertType = { [Op.like]: `%${alertType}%` };
    if (location)
      where[Op.or] = [
        { '$location.name$': { [Op.like]: `%${location}%` } },
        { '$location.code$': location },
      ];

    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const { count, rows } = await models.GeoAsset.findAndCountAll({
      limit: Number(limit),
      offset: Number(offset),
      include: geolocationModel().include,
      attributes: geolocationModel().attributes,
      where,
      order: [[sort, order]],
    });

    return {
      total: count,
      rows: rows.map((row) => mapGeo(row)),
    };
  }
}

module.exports = GeoAssetServices;
