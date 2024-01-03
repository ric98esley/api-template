const Joi = require('joi');


const { createPermissionSchema } = require('./permissions.schema');
const name = Joi.string().max(15);
const description = Joi.string().max(255);

const createRoleSchema = Joi.object({
  name: name.required(),
  description,
  permissions: Joi.array().items(createPermissionSchema).required(),
});

module.exports = {
  createRoleSchema,
};
