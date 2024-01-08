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

const createUserSchema = Joi.object({
  profile: Joi.object({
    name: name.required().min(3),
    lastName,
    phone,
    cardId: cardId.min(3).max(35),
    address,
  }),
  username: username.min(5).required(),
  groupId: id,
  email: email.required(),
  password: password.required(),
  role,
  isActive,
});

const updateUserSchema = Joi.object({
  username,
  isActive,
  email,
  role,
  groupId: id,
});

const searchUserSchema = Joi.object({
  username,
  search: toSearch,
  sort: toSearch,
  group: toSearch,
  order: toSearch.valid('ASC', 'DESC'),
  cardId,
  name,
  phone,
  lastName,
  email: toSearch,
  isActive,
  profile: toSearch,
  role,
  all: Joi.boolean(),
  limit,
  offset,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

const getUserSchema = Joi.object({
  id: id,
  username: username,
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  searchUserSchema,
};
