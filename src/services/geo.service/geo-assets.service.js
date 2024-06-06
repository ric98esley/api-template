const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');

const mapGeo = (data) => {
  return {
    ip: data.id,
    serial: data.serial,
    alert: data.alert,
    alertType: data.alertType,
    latitude: data.latitude,
    longitude: data.longitude,
  };
};

class GeoAssets {
  async create({ ip, serial, alert, alertType, latitude, longitude }) {
    const geoAsset = await models.GeoAssets.create({
      ip,
      serial,
      alert,
      alertType,
      latitude,
      longitude,
    });
    return mapGeo(geoAsset);
  }

  async find({
    ip,
    serial,
    alert,
    alertType,
    limit,
    offset,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }

    const where = {};

    if (ip) where.ip = { [Op.like]: `%${ip}%` };
    if (serial) where.serial = { [Op.like]: `%${serial}%` };
    if (alert) where.alert = alert;
    if (alertType) where.alertType = { [Op.like]: `%${alertType}%` };

    const { count, rows } = await models.GeoAssets.findAndCountAll({
      limit: Number(limit),
      offset: Number(offset),
      where,
      order: [[sort, order]],
    });

    return {
      total: count,
      rows: rows.map((row) => mapGeo(row)),
    };
  }
}

module.exports = { GeoAssets };
