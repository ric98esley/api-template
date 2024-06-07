const Joi = require('joi');

const id = Joi.number().integer();
const ip = Joi.string().ip();
const serial = Joi.string();
const alert = Joi.bool();
const alertType = Joi.string();
const latitude = Joi.number();
const longitude = Joi.number();
const createdAt = Joi.date();
const sort = Joi.string();
const order = Joi.string().valid('ASC', 'DESC');

const createGeoAssetSchema = Joi.object({
  serial: serial.required(),
  alert,
  alertType: alertType,
  latitude: latitude,
  longitude: longitude,
});

const findGeoAssetSchema = Joi.object({
  ip,
  serial,
  alert,
  alertType,
  latitude,
  sort,
  order,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

module.exports = {
  createGeoAssetSchema,
  findGeoAssetSchema
};
