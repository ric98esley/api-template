const GroupHierarchy = require("./group.role.handlers");
const userHandler = require("./user.auth.handler");

const groupHandler = new GroupHierarchy();

const authHandlers = {
  user: userHandler,
  group: groupHandler
}

module.exports = authHandlers;