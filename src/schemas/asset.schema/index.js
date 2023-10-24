const Joi = require('joi');
const { createAssetSpecification } = require('../category.schema/specification.schema');

const id = Joi.number().integer();
const serial = Joi.string();
const modelId = Joi.number().integer();
const depositId = Joi.number().integer();
const purchaseCost = Joi.number();
const deprecitionRate = Joi.number();
const notes = Joi.string().min(10);
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const toSearch = Joi.string();
const createdAt = Joi.date();

// Crear factura

const code = Joi.string();
const total = Joi.string();
const invoiceDate = Joi.date();

const createAssetSchema = Joi.object({
  serial: serial.required(),
  modelId: modelId.required(),
  depositId: depositId.required(),
  purchaseCost,
  deprecitionRate,
  specifications: createAssetSpecification,
});

const createBulkAssetSchema = Joi.object({
  assets: Joi.array().items(createAssetSchema.required()).required(),
  invoiceId: id,
  invoice: Joi.object({
    code: code.required().min(2),
    providerId: id.required(),
    total,
    invoiceDate,
  }),
}).oxor('invoiceId', 'invoice');

const updateAssetSchema = Joi.object({
  depositId,
  modelId,
  purchaseCost,
  deprecitionRate,
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
  // status, model, brand, category will be to string to search matches
  status: toSearch,
  deposit: toSearch,
  model: toSearch,
  brand: toSearch,
  category: toSearch,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

const getAssetSchema = Joi.object({
  id: id.required(),
  limit,
  offset,
});

module.exports = {
  createAssetSchema,
  updateAssetSchema,
  searchAsset,
  getAssetSchema,
  createBulkAssetSchema,
};
