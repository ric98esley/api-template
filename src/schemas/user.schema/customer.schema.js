const Joi = require('joi');

const id = Joi.number().integer();
const email = Joi.string().email();
const password = Joi.string().min(8);
const role = Joi.string();
const isActive = Joi.boolean();
const username = Joi.string();
const name = Joi.string();
const lastName = Joi.string().min(3);
const phone = Joi.string().max(20).empty('');
const cardId = Joi.string();
const address = Joi.string().empty('');
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const toSearch = Joi.string();
const createdAt = Joi.date();

const createCustomerSchema = Joi.object({
  name: name.required().min(3),
  lastName,
  phone,
  cardId: cardId.min(3).max(35),
  address,
});

const updateCustomerSchema = Joi.object({
  name: name.required().min(3),
  lastName,
  phone,
  cardId: cardId.min(3).max(35),
  address,
});

const searchCustomerSchema = Joi.object({
  name,
  lastName,
  phone,
  cardId,
  address,
})


const getCustomerSchema = Joi.object({
  id: id,
  phone: phone,
});

module.exports = {
  getCustomerSchema,
  updateCustomerSchema,
  searchCustomerSchema,
  createCustomerSchema
};
