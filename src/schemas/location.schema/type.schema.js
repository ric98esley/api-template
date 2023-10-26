const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const status = Joi.string();

const createTypeLocation = Joi.object({
  name: name.required().min(3),
  status
});
const updateTypeLocation = Joi.object({
  name,
  status
});

const searchType = Joi.object({
  name,
  status,
  limit: Joi.number().integer(),
  offset: Joi.number().integer(),
})

const getTypeLocation = Joi.object({
  id,
});

module.exports = { createTypeLocation, getTypeLocation, searchType, updateTypeLocation};
