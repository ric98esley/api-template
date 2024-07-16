const Joi = require('joi');

const id = Joi.number().integer();
const description = Joi.string();
const cost = Joi.number().integer();

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

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  getMaintenanceByIdSchema,
};




