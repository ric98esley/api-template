const express = require('express');
const passport = require('passport');

const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const {
  findMaintenanceSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  getMaintenanceByIdSchema,
} = require('../../schemas/maintenances.schema');

const MaintenanceService = require('../../services/maintenance.services/maintenance.service');
const AssetService = require('../../services/asset.service');

const maintenanceService = new MaintenanceService();
const assetService = new AssetService();

const router = express.Router();

router.use('/types', require('./maintenance_type.route'));

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findMaintenanceSchema, 'query'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const body = req.query;
      const maintenances = await maintenanceService.find(body);
      res.status(200).json(maintenances);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getMaintenanceByIdSchema, 'params'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { groupId } = req;

      const data = await maintenanceService.findOne(id, groupId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createMaintenanceSchema, 'body'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;

      const asset = await assetService.findOne({
        id: body.assetId,
        groupId: req.groupId,
        paranoid: false,
      });

      if (!asset) {
        return res.status(404).json({ message: 'Activo no encontrado' });
      }

      const maintenance = await maintenanceService.create({
        ...body,
        createdById: req.user.sub,
      });
      res.status(200).json(maintenance);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(updateMaintenanceSchema, 'body'),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const changes = req.body;

      const maintenance = await maintenanceService.findOne(id, req.groupId);

      if (maintenance.createdBy.id !== req.user.sub) {
        return res.status(403).json({
          message:
            'No tienes permisos para actualizar este mantenimiento, solo el usuario que lo creo puede actualizarlo',
        });
      }

      const updateMaintenance = await maintenanceService.update(id, changes);

      res.status(200).json(updateMaintenance);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
