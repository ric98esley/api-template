const Joi = require('joi');

const id = Joi.number().integer();
const quantity = Joi.string().pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, {
  name: 'numbers',
});
const min = Joi.number().integer();
const customer = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const type = Joi.string();
const description = Joi.string();
const target = Joi.object({
  productId: id,
  quantity,
  min,
});
const targets = Joi.array().items(target.required());

const createLot = Joi.object({
  customer: customer.required().min(8),
  description: description.required(),
  targets,
});

const findLot = Joi.object({
  customer,
  type,
  description,
  limit,
  offset,
});

const getLot = Joi.object({
  id: id.required(),
});

module.exports = { createLot, findLot, getLot };
