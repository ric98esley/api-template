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
    [ACTIONS.IMPORT]: {
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
  },
  [SCOPE.BRANDS]: {
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
  [SCOPE.MODELS]: {
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
  [SCOPE.GROUPS]: {
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
  [SCOPE.ASSETS]: {
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
  [SCOPE.WAREHOUSES]: {
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
  [SCOPE.LOCATIONS]: {
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
  [SCOPE.LOCATIONS_TYPE]: {
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
  [SCOPE.ZONES]: {
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
  [SCOPE.CONSUMABLES]: {
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
  [SCOPE.ACCESSORIES]: {
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
  [SCOPE.ORDERS]: {
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
    },
    [ACTIONS.CHECKING]: {
      possession: POSSESSION.ANY
    },
    [ACTIONS.CHECKOUT]: {
      possession: POSSESSION.ANY
    }
  },
  [SCOPE.MOVEMENTS]: {
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
  [SCOPE.CATEGORY_CLASSES]:
  {
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
    },
    [ACTIONS.IMPORT]: {
      possession: POSSESSION.ANY
    }
  },
}

module.exports = {
  grantSuperuser
}


