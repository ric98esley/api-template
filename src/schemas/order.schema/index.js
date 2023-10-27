const Joi = require('joi');
const { createMovementSchema } = require('./movement.schema');

const id = Joi.number().integer();
const description = Joi.string();
const type = Joi.string();
const notes = Joi.string();
const content = Joi.string();
const delivered = Joi.boolean();
const location = Joi.string();
const group = Joi.string();
const toSearch = Joi.string();
const createdAt = Joi.date();

const createOrderRecordSchema = Joi.object({
  description: description.required(),
  locationId: id.required(),
  notes,
  content,
  targets: Joi.array().items(createMovementSchema.required()),
});

const updateOrderRecordSchema = Joi.object({
  description,
  locationId: id,
  notes,
  content,
  delivered,
});

const searchOrderRecordSchema = Joi.object({
  location,
  group,
  description,
  type,
  notes,
  content,
  delivered,
  limit: id,
  offset: id,
  sort: toSearch,
  order: toSearch.valid('ASC', 'DESC'),
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

const getOrderRecordSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createOrderRecordSchema,
  updateOrderRecordSchema,
  searchOrderRecordSchema,
  getOrderRecordSchema
};
