const Joi = require('joi');
const { createAssetSpecification } = require('../category.schema/specification.schema');

const id = Joi.number().integer();
const serial = Joi.string();
const modelId = Joi.number().integer();
const notes = Joi.string();
const description = Joi.string();
const content = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const toSearch = Joi.string();
const createdAt = Joi.date();
const message = Joi.string();


const createAssetSchema = Joi.object({
  serial: serial.required(),
  modelId: id.required(),
  locationId: id.required(),
  notes: notes.empty(''),
  specifications: createAssetSpecification,
});

const createBulkAssetSchema = Joi.object({
  assets: Joi.array().items(createAssetSchema.required()).required(),
  description: description.required(),
  notes,
  content,
});

const importAssetSchema = Joi.object({
  description: description.required(),
  notes,
  content,
})

const updateAssetSchema = Joi.object({
  locationId: id,
  modelId,
  notes,
});

const searchAsset = Joi.object({
  serial,
  limit,
  offset,
  sort: toSearch,
  order: toSearch.valid('ASC', 'DESC'),
  all: Joi.boolean(),
  enabled: Joi.boolean(),
  type: toSearch,
  // status, model, brand, category will be to string to search matches
  status: toSearch,
  location: toSearch,
  model: toSearch,
  brand: toSearch,
  category: toSearch,
  startDate: createdAt,
  specification: toSearch,
  specificationValue: toSearch,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

const getAssetSchema = Joi.object({
  id: id.required(),
  limit,
  offset,
});

const deleteAssetSchema = Joi.object({
  message: message.required()
})

module.exports = {
  createAssetSchema,
  updateAssetSchema,
  searchAsset,
  getAssetSchema,
  createBulkAssetSchema,
  importAssetSchema,
  deleteAssetSchema
};
