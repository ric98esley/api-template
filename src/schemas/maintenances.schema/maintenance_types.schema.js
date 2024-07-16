const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();

const createMaintenanceTypeSchema = Joi.object({
  name: name.required(),
  description: description,
});

const updateMaintenanceTypeSchema = Joi.object({
  name: name,
  description: description,
});

const getMaintenanceTypeByIdSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createMaintenanceTypeSchema,
  updateMaintenanceTypeSchema,
  getMaintenanceTypeByIdSchema,
};

