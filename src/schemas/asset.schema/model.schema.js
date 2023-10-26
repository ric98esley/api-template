const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string().min(2);
const categoryId = Joi.number().integer();
const limit = Joi.number().integer()
const offset = Joi.number().integer()

const createAssetModel = Joi.object({
    name: name.required(),
    categoryId: categoryId.required(),
    brandId: id.required()
})

const updateAssetModel = Joi.object({
    name,
    categoryId,
    brandId: id
})

const getAssetModel = Joi.object({
    id: id.required(),
})

const searchModel = Joi.object({
    id,
    name,
    category: name,
    brand: name,
    limit,
    offset
})

module.exports = { createAssetModel, updateAssetModel, getAssetModel, searchModel };