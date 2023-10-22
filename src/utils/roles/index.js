const ACTIONS = require("./enums/actions");
const SCOPE = require("./enums/scope");
const POSSESSION = require("./enums/possession");
const ROLES = require("./enums/roles");
const { grants } = require("./grants");


module.exports = {
  ROLES,
  SCOPE,
  ACTIONS,
  POSSESSION,
  grants,
  roles: Object.values(ROLES),
  actions: Object.values(ACTIONS),
}
