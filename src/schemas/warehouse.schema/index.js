const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string();
const status = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createWarehouse = Joi.object({
    name: name.required().min(3),
    status: status.required().min(8),
    groupId: id.required()
})

const searchWarehouse = Joi.object({
    name,
    status,
    groupId: id,
    limit,
    offset
})

const updateWarehouse = Joi.object({
    name,
    status,
    groupId: id
})

const getWarehouse = Joi.object({
    id: id.required()
})

module.exports = { createWarehouse, updateWarehouse, getWarehouse, searchWarehouse};

