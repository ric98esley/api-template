const express = require('express');
const passport = require('passport');

const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const { SCOPE, ACTIONS } = require('../../utils/roles');

const MaintenanceTypeService = require('../../services/maintenance.services/maintenance_type.service');
const {
  findMaintenanceTypeSchema,
  createMaintenanceTypeSchema,
  updateMaintenanceTypeSchema,
} = require('../../schemas/maintenances.schema/maintenance_types.schema');
const { getMaintenanceByIdSchema } = require('../../schemas/maintenances.schema');

const maintenanceTypeService = new MaintenanceTypeService();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findMaintenanceTypeSchema, 'query'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      const types = await maintenanceTypeService.find(query);
      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createMaintenanceTypeSchema, 'body'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;

      const type = await maintenanceTypeService.create({
        ...body,
        createdById: user.sub,
      });

      res.status(200).json(type);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getMaintenanceByIdSchema, 'params'),
  validatorHandler(updateMaintenanceTypeSchema, 'body'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;

      const type = await maintenanceTypeService.update(id, body);

      res.status(200).json(type);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getMaintenanceByIdSchema, 'params'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const type = await maintenanceTypeService.delete({ id });

      res.status(201).json(type);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
