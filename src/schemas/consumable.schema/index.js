const Joi = require('joi');

const id = Joi.number().integer();
const notes = Joi.string();
const search = Joi.string();
const quantity = Joi.string();
const deposit = Joi.string();
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const createdAt = Joi.date();

const createMovementConsumable = Joi.object({
  quantity: quantity.pattern(/^\d+(\.[0-9][0-9]?)?(\/\d+?)?$/, { name: 'numbers'}),
  notes: notes.allow(""),
  inTransit: Joi.boolean(),
});


const findConsumable = Joi.object({
  id,
  search,
  deposit,
  quantity,
  notes,
  limit,
  offset,
  startDate: createdAt,
  endDate: createdAt.greater(Joi.ref('startDate')),
})
.with('startDate', 'endDate')
.with('endDate', 'startDate');
;

module.exports = { createMovementConsumable, findConsumable };
