const ROLES = {
  COSTUMER: 'cliente',
  SELLER: 'vendedor',
  ADMIN: 'administrador',
  AUDITOR: 'auditor',
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
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.ASISTENTE, ROLES.RECEPTOR],
      own: [],
    },
    read: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.TECNICO, ROLES.ASISTENTE, ROLES.RECEPTOR],
      own: [ROLES.TAQUILLA],
    },
    update: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [ROLES.ASISTENTE, ROLES.RECEPTOR],
      own: [],
    },
    delete: {
      all: [ROLES.SUPERUSER, ROLES.AUDITOR],
      group: [],
      own: [],
    },
  }
};

Object.freeze(permissions);

module.exports = {
  ROLES,
  permissions
}
