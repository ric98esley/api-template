const boom = require('@hapi/boom');

const sequelize = require('../libs/sequelize');
const { models } = require('../libs/sequelize');

const { grants, POSSESSION } = require('../utils/roles');
const authHandlers = require('../utils/roles/handlers');

function checkUser() {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const checkedUser = await getUser(user.sub);
      if (!checkedUser.isActive) return next(boom.unauthorized());
      if (checkedUser.role !== user.role) return next(boom.unauthorized());
      next();
    } catch (error) {
      next(boom.serverUnavailable());
      console.log(error);
    }
  };
}

async function getGroups(userId, next) {
  try {
    const recursiveQuery = `
          WITH RECURSIVE GroupHierarchy AS
            ( SELECT
                id,
                name,
                manager_id,
                parent_id
                  FROM groups
                    WHERE manager_id = ${userId} UNION ALL
                    SELECT g.id, g.name, g.manager_id, g.parent_id
                    FROM groups AS g
                  INNER JOIN GroupHierarchy AS gh ON g.parent_id = gh.id )
                    SELECT id FROM GroupHierarchy;
      `;

    const rta = await sequelize.query(recursiveQuery, {
      type: sequelize.QueryTypes.SELECT,
    });
    const groupId = rta.map((group) => group.id);
    return groupId;
  } catch (error) {
    console.log(error);
    next(boom.forbidden());
  }
}

async function getUser(userId) {
  try {
    const rta = await sequelize.models.User.findOne({
      id: userId,
    });

    return rta.dataValues;
  } catch (error) {
    boom.forbidden();
  }
}

function checkAuth({ route, crud }) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      // if (user.role == 'superuser') return next();

      const role = await models.Role.findOne({
        where: { name: user.role },
      });

      if(!role) throw boom.forbidden(
        'No tienes permisos para acceder a esta ruta'
      );

      console.log(role.ability[route][crud]);

      if (!grants[user.role]) throw boom.forbidden();
      if (!grants[user.role][route]) throw boom.forbidden();
      const { possession, callback } = grants[user.role][route][crud];

      if (possession === POSSESSION.ANY) {
        if (callback) {
          callback(req);
        }
      }

      if (possession === POSSESSION.STORE) {
        const resolver = authHandlers[possession][crud];
        if (resolver) resolver();
      }

      if (possession === POSSESSION.OWN) {
        if (callback) {
          callback(req);
        }
      }
      next();
    } catch (error) {
      return next(error);
    }
  };
}
async function checkPermissions(req, res, next) {
  try {
    const user = req.user;

    if (user.role == 'superuser' || user.role == 'auditor') return next();

    const groupId = await getGroups(user.sub, next);

    const method = req.method;

    if (method == 'GET') {
      req.query.groupId = groupId;
    }

    if (method == 'PATCH') {
      if (req.body.groupId) {
        const isIn = groupId.includes(req.body.groupId);
        if (!isIn) throw new Error();
      }

      req.query.groupId = groupId;
    }
    if (method == 'POST') {
      const isIn = groupId.includes(req.body.groupId);
      if (!isIn) throw new Error();
    }
    next();
  } catch (error) {
    next(boom.forbidden());
  }
}

async function checkSuperuser(req, res, next) {
  try {
    const superuser = await sequelize.models.User.findOne({
      where: { role: 'superuser' },
    });
    if (!superuser) {
      // Si no hay ningún superusuario en la base de datos, permite el acceso a la ruta /create-superuser
      return next();
    } else {
      next(boom.notFound());
    }
  } catch (error) {
    next(boom.notFound());
  }
}

module.exports = {
  checkUser,
  checkSuperuser,
  checkPermissions,
  checkAuth,
};
