const ACTIONS = require("../enums/actions");
const SCOPE = require("../enums/scope");
const POSSESSION = require("../enums/possession");

const grantSuperuser = {
  [SCOPE.USERS]: {
    [ACTIONS.CREATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.READ]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.UPDATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.DELETE]: {
      possession: POSSESSION.ANY
    }
  },
  [SCOPE.CUSTOMER]: {
    [ACTIONS.CREATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.READ]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.UPDATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.DELETE]: {
      possession: POSSESSION.ANY
    }
  },
  [SCOPE.CATEGORIES]: {
    [ACTIONS.CREATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.READ]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.UPDATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.DELETE]: {
      possession: POSSESSION.ANY
    }
  },
  [SCOPE.SPECIFICATIONS]: {
    [ACTIONS.CREATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.READ]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.UPDATE]: {
      possession: POSSESSION.ANY,
    },
    [ACTIONS.DELETE]: {
      possession: POSSESSION.ANY
    }
  }
}

module.exports = {
  grantSuperuser
}


