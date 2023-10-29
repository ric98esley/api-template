const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const search = Joi.string();
const code = Joi.string();
const price = Joi.string();
const unit = Joi.string();
const min = Joi.number().integer();
const description = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createProduct = Joi.object({
  serial: code.required().min(2),
  modelId: id,
  model: Joi.object({
    name: name.required().min(3),
    price: price.allow(null),
    min: min.allow(null),
    unit: unit.required(),
    categoryId: id,
    category: Joi.object({
      name: name.required()
    })
  }).oxor('categoryId', 'category'),
}).oxor('modelId', 'model');
const updateProduct = Joi.object({
  code,
  name,
  price,
  min,
  unit,
  description,
  categoryId: id,
});

const getProduct = Joi.object({
  id: id.required(),
});

const findProduct = Joi.object({
  search,
  category: search,
  code,
  name,
  price,
  min,
  unit,
  description,
  categoryId: id,
  limit,
  offset,
});

module.exports = { createProduct, getProduct, updateProduct, findProduct };
