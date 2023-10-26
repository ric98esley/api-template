const express = require('express');
const passport = require('passport');

const ZonesService = require('../../services/locations.service/zone.service');
const LogService = require('../../services/log.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const {
  updateZoneSchema,
  createZoneSchema,
  getZoneSchema,
  searchZoneSchema,
} = require('../../schemas/location.schema/zone.schema');
const { ACTIONS, SCOPE } = require('../../utils/roles');

const router = express.Router();
const service = new ZonesService();
const logService = new LogService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchZoneSchema, 'query'),
  checkAuth({ route: SCOPE.ZONES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query
      const zones = await service.find(query);
      res.json(zones);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getZoneSchema, 'params'),
  checkAuth({ route: SCOPE.ZONES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const zone = await service.findOne(id);
      res.json(zone);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createZoneSchema, 'body'),
  checkAuth({ route: SCOPE.ZONES, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const user = req.user
      const createdById = user.sub;
      const body = req.body;
      body.createdById = createdById;
      const newZone = await service.create(body);

      const details = {
        message: `Se ha creado la zona ${newZone.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.ZONES,
        targetId: newZone.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(201).json(newZone);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getZoneSchema, 'params'),
  validatorHandler(updateZoneSchema, 'body'),
  checkAuth({ route: SCOPE.ZONES, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      const zone = await service.update(id, body);
      const details = {
        message: `Se ha modificado la zona ${zone.dataValues.name}`,
        query: body
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: SCOPE.ZONES,
        targetId: zone.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.json(zone);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getZoneSchema, 'params'),
  checkAuth({ route: SCOPE.ZONES, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const zona = await service.delete(id);

      const details = {
        message: `Se ha borrado la zona ${zona.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: SCOPE.ZONES,
        targetId: zona.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(202).json({
        message: details.message,
        target: zona,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
