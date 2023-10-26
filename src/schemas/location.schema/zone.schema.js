const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createZoneSchema = Joi.object({
  name: name.required().min(3),
});

const updateZoneSchema = Joi.object({
  name,
});

const getZoneSchema = Joi.object({
  id
});

const searchZoneSchema = Joi.object({
  limit,
  offset,
  name
})

module.exports = { createZoneSchema, updateZoneSchema, getZoneSchema, searchZoneSchema };