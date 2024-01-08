const POSSESSION = require("../enums/possession");
const GroupHierarchy = require("../handlers/group.role.handlers");

const groupHandler = new GroupHierarchy();

const assetsGrants = {
  [POSSESSION.ANY]: (req) => {
    next()
  },
  [POSSESSION.OWN]: async (value) => {
    const groupId = await groupHandler.getGroupsByManagerId(value);
  },
}

module.exports = assetsGrants