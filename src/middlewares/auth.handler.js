const boom = require('@hapi/boom');

const sequelize = require('../libs/sequelize');
const { permissions } = require('../utils/roles');

function checkRoles(...roles) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const checkedUser = await getUser(user.sub);

      if (!checkedUser.isActive) next(boom.unauthorized());

      if (roles.includes(checkedUser.role)) {
        next();
      } else {
        next(boom.forbidden());
      }
    } catch (error) {
      next(boom.internal());
    }
  };
}
function checkRoles2({ route, crud }) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const roles = permissions[route][crud];
      const checkedUser = await getUser(user.sub);
      if (!checkedUser.isActive) return next(boom.unauthorized());
      const allRoles = [...roles.all, ...roles.group, ...roles.own];
      if (!allRoles.includes(checkedUser.role)) {
        return next(boom.forbidden());
      }
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
    const rta = await sequelize.models.Auth.findOne({
      userId
    });

    return rta.dataValues;
  } catch (error) {
    boom.forbidden();
  }
}

function checkAuth({ route, crud }) {
  return async (req, res, next) => {
    try {
      const auths = permissions[route][crud];
      const user = req.user;

      if (auths.all.includes(user.role)) {
        return next();
      }

      if (auths.group.includes(user.role)) {
        const groupId = await getGroups(user.sub, next);
        if (crud === 'read') {
          req.query.groupId = groupId;
        }

        if (crud === 'update') {
          if (req.body.groupId) {
            const isIn = groupId.includes(req.body.groupId);
            if (!isIn) throw new Error();
          }

          req.query.groupId = groupId;
        }
        if (crud === 'create') {
          const isIn = groupId.includes(req.body.groupId);
          if (!isIn) throw new Error();
        }
        return next();
      }

      if (auths.own.includes(user.role)) {
        if (crud === 'read') {
          req.query.managerId = user.sub;
        }

        if (crud === 'update') {
          if (req.body.userId) {
            const isIn = req.query.userId == user.sub;
            if (!isIn) throw new Error();
          }
        }
        return next();
      }
      console.log(req.user);
      return next();
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
  checkRoles,
  checkRoles2,
  checkSuperuser,
  checkPermissions,
  checkAuth,
};
