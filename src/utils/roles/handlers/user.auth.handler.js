const boom = require('@hapi/boom');
const ROLES = require('../enums/roles');

const userHandler = {
  store: {
    create(req) {
      if(req.body.role == ROLES.SUPERUSER || req.body.role == ROLES.AUDIT) throw boom.forbidden();
    },
    read(req) {
    }
  },
  own: {}
}

module.exports = userHandler