const Joi = require('joi');

const { abilitySchema } = require('./permissions.schema');
const name = Joi.string().max(15);
const description = Joi.string().max(255);
const id = Joi.number().integer();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createRoleSchema = Joi.object({
  name: name.required(),
  description,
  ability: abilitySchema.required(),
});

const searchRoleSchema = Joi.object({
  name,
  description,
  limit,
  offset,
});

const getRoleSchema = Joi.object({
  id: id.required(),
})

const updateRoleSchema = Joi.object({
  name,
  description,
  ability: abilitySchema.required(),
});

module.exports = {
  createRoleSchema,
  searchRoleSchema,
  getRoleSchema,
  updateRoleSchema,
};
