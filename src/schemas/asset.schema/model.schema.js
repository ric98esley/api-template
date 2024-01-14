const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string();
const limit = Joi.number().integer().greater(0);
const offset = Joi.number().integer().greater(-1);

const createAssetModel = Joi.object({
    name: name.required().min(2)    ,
    categoryId: id.required(),
    brandId: id.required()
})

const updateAssetModel = Joi.object({
    name,
    categoryId: id,
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
    categoryId: id,
    brandId: id,
    limit,
    offset
})

module.exports = { createAssetModel, updateAssetModel, getAssetModel, searchModel };