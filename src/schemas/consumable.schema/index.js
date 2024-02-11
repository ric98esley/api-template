const Joi = require('joi');
const { createProduct } = require('./product.schema');

const id = Joi.number().integer();
const notes = Joi.string();
const search = Joi.string();
const min = Joi.number().integer().greater(0);
const quantity = Joi.string();
const location = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const createdAt = Joi.date();
const description = Joi.string();

const createWarehouseProduct = Joi.object({
  // description: description.required,
  notes,
  productId: id,
  min,
  locationId: id.required(),
  quantity: quantity
    .pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, { name: 'quantity' })
    .required(),
  product: createProduct,
});

const getConsumable = Joi.object({
  locationId: id.required(),
  productId: id.required(),
});

const updateConsumable = Joi.object({
  min,
});

const findConsumable = Joi.object({
  id,
  search,
  location,
  quantity,
  notes,
  limit,
  offset,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

module.exports = {
  findConsumable,
  createWarehouseProduct,
  getConsumable,
  updateConsumable,
};
