const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();


const createBrand = Joi.object({
    name: name.min(2).required()
})

const updateBrand = Joi.object({
    name
})

const searchBrand = Joi.object({
    id,
    name,
    limit,
    offset
})

const getBrand = Joi.object({
    id: id.required()
})

module.exports = { createBrand, updateBrand, getBrand, searchBrand};