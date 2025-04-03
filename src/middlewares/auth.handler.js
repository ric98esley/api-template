const boom = require('@hapi/boom');

const sequelize = require('../libs/sequelize');
const { models } = require('../libs/sequelize');

function checkUser() {
  return async (req, res, next) => {
    try {
      const user = req.user;

      const checkedUser = await getUser(user.sub);

      if (!checkedUser.isActive)
        return next(boom.unauthorized('Usuario inactivo'));
      if (checkedUser.role !== user.role)
        return next(boom.unauthorized('Usuario cambio de rol'));

      req.user.groupId = checkedUser.groupId;
      next();
    } catch (error) {
      next(boom.serverUnavailable());
      console.log(error);
    }
  };
}

async function getGroups(groupAllowed, next) {
  try {
    const recursiveQuery = `
          WITH RECURSIVE GroupHierarchy AS
            ( SELECT
                id,
                name,
                manager_id,
                parent_id
                  FROM groups_t
                    WHERE id = ${groupAllowed} UNION ALL
                    SELECT g.id, g.name, g.manager_id, g.parent_id
                    FROM groups_t AS g
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
    const rta = await sequelize.models.User.findByPk(userId);

    return rta.dataValues;
  } catch (error) {
    boom.forbidden();
  }
}

const checkGroupPermission = (groupId, permittedGroups) => {
  const isIn = permittedGroups.includes(Number(groupId));
  if (!isIn)
    throw boom.badRequest('No tienes permisos para acceder a este grupo');
};

function checkAuth({ route, crud }) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Obtener rol del usuario
      const role = await models.Role.findOne({
        where: { name: user.role },
      });

      if (!role)
        throw boom.forbidden('No tienes permisos para acceder a esta ruta');

      const routeAbilities = role.ability[route];
      if (!routeAbilities)
        throw boom.forbidden('No tienes permisos para acceder a esta ruta');

      const ability = routeAbilities[crud];
      if (!ability || ability === 'none') {
        throw boom.forbidden('No tienes permisos para acceder a esta ruta');
      }

      // Manejo de permisos basado en habilidad
      let groupId;
      if (ability === 'any') {
        const parentGroup = await sequelize.models.Group.findOne({
          where: { parentId: null },
        });
        groupId = await getGroups(parentGroup.id, next);
      }
      if (ability === 'group') {
        groupId = await getGroups(user.groupId, next);
      }
      if (ability === 'own') {
        groupId = [user.groupId];
      }

      // Verificación de grupo en query o body
      if (ability !== 'none') {
        const groupIdQueryOrBody = req.query.groupId || req.body.groupId;
        if (groupIdQueryOrBody) {
          checkGroupPermission(groupIdQueryOrBody, groupId);
        }
        if(!req.query.groupId) {
          req.query.groupId = groupId;
        }
        req.groupId = groupId;
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
}

function checkRefreshToken() {
  return async (req, res, next) => {
    try {
      const refreshToken = req.headers['authorization'].split(' ')[1];

      const session = await models.Session.findOne({
        where: { token: refreshToken },
      });

      if (!session) {
        throw boom.unauthorized('Sección expirada');
      }

      next();
    } catch (error) {
      next(boom.unauthorized());
    }
  };
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
  checkRefreshToken,
  checkAuth,
};
