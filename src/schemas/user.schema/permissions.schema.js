const Joi = require('joi');

const role = Joi.string().max(15);
const scope = Joi.string().max(15);
const capability = Joi.string().max(15);
const possession = Joi.string().max(15);

const createPermissionSchema = Joi.object({
  scope: scope.required(),
  capability: capability.required(),
  possession: possession.required(),
})

const updatePermissionSchema = Joi.object({
  scope,
  capability,
  possession,
});

module.exports = {
  createPermissionSchema,
  updatePermissionSchema,
}