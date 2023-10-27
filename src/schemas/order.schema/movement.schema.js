const Joi = require('joi');

const id = Joi.number().integer();
const assetId = Joi.number().integer();
const quantity = Joi.string();

const createdAt = Joi.date();
const toSearch = Joi.string();

const createMovementSchema = Joi.object({
  quantity: quantity.pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, { name: 'numbers'}),
  assetId: assetId.required(),
});

const getMovementSchema = Joi.object({
  id: id.required(),
});


const searchMovementSchema = Joi.object({
  paranoid: Joi.boolean(),
  all: Joi.boolean(),
  type: toSearch,
  location: toSearch,
  group: toSearch,
  serial: toSearch,
  category: toSearch,
  model: toSearch,
  brand: toSearch,
  limit: id,
  offset: id,
  sort: toSearch,
  order: toSearch.valid('ASC', 'DESC'),
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

module.exports = {
  createMovementSchema,
  getMovementSchema,
  searchMovementSchema
};