const Joi = require('joi');

const id = Joi.number().integer();
const quantity = Joi.string().pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, {
  name: 'numbers',
});
const min = Joi.number().integer();
const customer = Joi.string();
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
});

const getLot = Joi.object({
  id: id.required(),
});

module.exports = { createLot, findLot, getLot };
