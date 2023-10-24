const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const search = Joi.string();
const type = Joi.string();
const description = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createCategory = Joi.object({
  name: name.min(3).required(),
  description,
  type,
  customFields: Joi.array().items(
    Joi.object({
      typeId: id.required(),
    })
  ),
});

const updateCategory = Joi.object({
  name,
  description,
  type,
  customFields: Joi.array().items(
    Joi.object({
      typeId: id.required(),
    })
  ),
  removeFields: Joi.array().items(
    Joi.object({
      typeId: id.required(),
    })
  ),
});

const searchCategory = Joi.object({
  id,
  name,
  search,
  type,
  description,
  limit,
  offset,
})

const getCategory = Joi.object({
  id: id.required(),
});

module.exports = { createCategory, updateCategory, getCategory,searchCategory };
