const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const code = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const sort = Joi.string();
const order = Joi.string().valid('ASC', 'DESC');

const createGroup = Joi.object({
  name: name.required().min(3),
  code: code.required().min(2),
  parentId: id.required(),
  managerId: id,
});
const updateGroup = Joi.object({
    name,
    code,
    parentId: id,
    managerId: id,
});

const getGroup = Joi.object({
  id: id.required(),
});

const searchGroup = Joi.object({
  id,
  name,
  code,
  parent: name,
  manager: name,
  managerId: id,
  sort,
  order,
  limit,
  offset,
});

module.exports = { createGroup, getGroup, updateGroup, searchGroup };
