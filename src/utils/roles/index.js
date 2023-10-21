const ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
  AUDIT: 'audit',
  SUPERUSER: 'superuser',
};

const permissions = {
  products: {
    create: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.ADMIN, ROLES.ADMIN],
      own: [],
    },
    read: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.TECNICO, ROLES.ASISTENTE, ROLES.RECEPTOR],
      own: [ROLES.TAQUILLA],
    },
    update: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.ASISTENTE],
      own: [],
    },
    delete: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [],
      own: [],
    },
  },
  users: {
    create: {
      all: [ROLES.SUPERUSER, ROLES.AUDIT],
      store: [ROLES.ADMIN, ROLES.SELLER],
      own: [ROLES.CUSTOMER],
    },
    read: {
      all: [ROLES.SUPERUSER, ROLES.AUDIT],
      store: [ROLES.ADMIN, ROLES.SELLER],
      own: [ROLES.TAQUILLA],
    },
    update: {
      all: [ROLES.SUPERUSER, ROLES.AUDIT],
      store: [],
      own: [ROLES.ADMIN, ROLES.SELLER, ROLES.CUSTOMER],
    },
    delete: {
      all: [ROLES.SUPERUSER, ROLES.AUDIT],
      group: [],
      own: [ROLES.ADMIN, ROLES.SELLER, ROLES.CUSTOMER],
    },
  }
};

Object.freeze(permissions);

module.exports = {
  ROLES,
  permissions
}
