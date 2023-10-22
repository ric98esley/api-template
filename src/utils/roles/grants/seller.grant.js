const ACTIONS = require("../enums/actions");
const SCOPE = require("../enums/scope");
const POSSESSION = require("../enums/possession");
const boom = require("@hapi/boom");

const grantSeller = {
  [SCOPE.USERS]: {
    [ACTIONS.CREATE]: {
      possession: POSSESSION.OWN,
    },
    [ACTIONS.READ]: {
      possession: POSSESSION.STORE,
    },
    [ACTIONS.UPDATE]: {
      possession: POSSESSION.OWN,
    },
    [ACTIONS.DELETE]: {
      possession: POSSESSION.OWN,
    }
  },
};

module.exports = {
  grantSeller,
};
