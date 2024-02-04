const Joi = require('joi');

const id = Joi.number().integer();
const quantity = Joi.string().pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, { name: 'numbers'})
const customer = Joi.string().min(8);
const type = Joi.string();
const description = Joi.string();
const target = Joi.object({
  productId: id,
  quantity
})
const targets = Joi.array().items(target.required())

const createLot = Joi.object({
  customer: customer.required(),
  description: description.required(),
  targets
});

module.exports = { createLot };
