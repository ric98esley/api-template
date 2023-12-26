const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const search = Joi.string();
const description = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createCategoryClass = Joi.object({
  name: name.min(3).required(),
  description
});

const updateCategoryClass = Joi.object({
  name,
  description,
});

const searchCategoryClass = Joi.object({
  id,
  name,
  search,
  description,
  limit,
  offset,
})

const getCategoryClass = Joi.object({
  id: id.required(),
});

module.exports = { createCategoryClass, updateCategoryClass, getCategoryClass,searchCategoryClass };
