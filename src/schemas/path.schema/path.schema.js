const Joi = require('joi');

const id = Joi.number().integer();
const path = Joi.string().min(3);
const pathName = Joi.string().min(3).max(255);
const isAllow = Joi.boolean();

const search = Joi.string().max(255);
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createPathSchema = Joi.object({
  path: path.required(),
  name: pathName.required(),
  isAllowed: isAllow.required()
})

const updatePathSchema = Joi.object({
  path,
  name: pathName,
  isAllow
}).min(1);

const getPathSchema = Joi.object({
  id: id.required()
});

const findPathsSchema = Joi.object({
  search,
  limit,
  offset
});

module.exports = {
  createPathSchema,
  updatePathSchema,
  getPathSchema,
  findPathsSchema
};