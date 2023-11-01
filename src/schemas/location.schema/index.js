const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const phone = Joi.string();
const rif = Joi.string().min(1);
const address = Joi.string();
const code = Joi.string();
const toSearch = Joi.string();
const isActive = Joi.boolean();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const createdAt = Joi.date();

const createLocationSchema = Joi.object({
  code: code.required().min(3),
  isActive,
  name: name.required().min(4),
  zoneId: id.required(),
  phone: phone.max(20).min(5),
  typeId: id.required(),
  groupId: id.required(),
  managerId: id,
  rif,
  address: address,
});

const updateLocationSchema = Joi.object({
  code: code.min(3),
  name: name.min(4),
  isActive,
  typeId: id,
  groupId: id,
  phone: phone.min(5).max(20),
  rif,
  managerId: id,
  zoneId: id,
  address,
});

const getLocationSchema = Joi.object({
  id: id.required(),
});

const searchLocationSchema = Joi.object({
  search: toSearch,
  name,
  code,
  group: toSearch,
  manager: toSearch,
  type: toSearch,
  rif,
  status : toSearch,
  address,
  limit,
  offset,
  order: toSearch.valid('ASD', 'DESC'),
  sort: toSearch,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
}).with('startDate', 'endDate')
.with('endDate', 'startDate');

module.exports = {
  createLocationSchema,
  updateLocationSchema,
  getLocationSchema,
  searchLocationSchema,
};
