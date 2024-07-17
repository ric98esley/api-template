const Joi = require('joi');

const id = Joi.number().integer();
const description = Joi.string();
const cost = Joi.number().integer();

const serial = Joi.string();
const model = Joi.string();
const brand = Joi.string();
const category = Joi.string();
const type = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const createdBy = Joi.string();

const createMaintenanceSchema = Joi.object({
  assetId: id.required(),
  maintenanceTypeId: id.required(),
  description: description,
  cost: cost,
});

const updateMaintenanceSchema = Joi.object({
  assetId: id,
  maintenanceTypeId: id,
  description: description,
  cost: cost,
});

const getMaintenanceByIdSchema = Joi.object({
  id: id.required(),
});

const findMaintenanceSchema = Joi.object({
  description,
  cost,
  serial,
  model,
  brand,
  category,
  type,
  createdBy,
  limit,
  offset
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  getMaintenanceByIdSchema,
  findMaintenanceSchema
};




