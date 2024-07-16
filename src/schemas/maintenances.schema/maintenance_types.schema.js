const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createMaintenanceTypeSchema = Joi.object({
  name: name.required(),
  description: description,
});

const updateMaintenanceTypeSchema = Joi.object({
  name: name,
  description: description,
});

const findMaintenanceTypeSchema = Joi.object({
  name: name,
  description: description,
  limit: limit,
  offset: offset,
});

const getMaintenanceTypeByIdSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createMaintenanceTypeSchema,
  updateMaintenanceTypeSchema,
  getMaintenanceTypeByIdSchema,
  findMaintenanceTypeSchema
};

