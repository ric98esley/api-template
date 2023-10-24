const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const value = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const toSearch = Joi.string();


const createSpecification = Joi.object({
  name: name.required(),
});

const getSpecification = Joi.object({
  id: id.required(),
})

const assetSpecification = Joi.object({
  typeId: id.required(),
  value: value.required(),
});

const updateSpecification = Joi.object({
  name
});

const searchSpecification = Joi.object({
  name,
  limit,
  offset,
  sort: toSearch,
  order: toSearch.valid('ASC', 'DESC'),
});

const createAssetSpecification = Joi.array().items(assetSpecification);

const categoryHasSpecification = Joi.object({
  categoryId: id.required(),
  specificationId: id.required()
})


module.exports = {
  createSpecification,
  getSpecification,
  assetSpecification,
  updateSpecification,
  searchSpecification,
  createAssetSpecification,
  categoryHasSpecification,
};
