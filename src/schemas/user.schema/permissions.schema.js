const Joi = require('joi');
const { ACTIONS, SCOPE, POSSESSION } = require('../../utils/roles');

const role = Joi.string().max(15);
const scope = Joi.string().max(15);
const capability = Joi.string().max(15).valid(...Object.values(POSSESSION));
const possession = Joi.string().max(15);

let permissions = {};

for (let action in ACTIONS) {
  permissions[ACTIONS[action]] = capability;
}

const routeActionsSchema = Joi.object(permissions);

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


let routes = {};

for(let scope in SCOPE) {
  routes[SCOPE[scope]] = routeActionsSchema;
}

const abilitySchema = Joi.object(routes);

module.exports = {
  createPermissionSchema,
  updatePermissionSchema,
  abilitySchema
}