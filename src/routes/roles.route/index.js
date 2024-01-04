const express = require('express');
const passport = require('passport');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

const { checkAuth, checkUser } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  searchRoleSchema,
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
} = require('../../schemas/user.schema/role.schema');

const LogService = require('../../services/log.service');
const RoleService = require('../../services/user.service/role.service');
const logService = new LogService();
const roleService = new RoleService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchRoleSchema, 'query'),
  checkUser(),
  checkAuth({ route: SCOPE.ROLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    const { name, limit, offset } = req.query;
    try {
      const roles = await roleService.find({
        name,
        limit,
        offset,
      });
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: SCOPE.ROLES, crud: ACTIONS.CREATE }),
  validatorHandler(createRoleSchema, 'body'),
  async (req, res, next) => {
    const { body: role } = req;
    try {
      const newRole = await roleService.create(role);
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.ROLES,
        targetId: newRole.dataValues.id,
        details: `${req.user.username} creo  un nuevo rol: ${newRole.name}`,
        ip: req.ip,
        createdById: req.user.id,
      });
      res.status(201).json(newRole);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getRoleSchema, 'params'),
  validatorHandler(updateRoleSchema, 'body'),
  checkAuth({ route: SCOPE.ROLES, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const body = req.body;
      const updatedRole = await roleService.update({
        id,
        data: body,
      });

      res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
