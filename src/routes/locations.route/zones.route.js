const express = require('express');
const passport = require('passport');

const ZonesService = require('../../services/locations.service/zone.service');
const validatorHandler = require('../../middlewares/validator.handler');
const { checkRoles, checkUser, checkAuth } = require('../../middlewares/auth.handler');
const {
  updateZoneSchema,
  createZoneSchema,
  getZoneSchema,
  searchZoneSchema,
} = require('../../schemas/location.schema/zone.schema');
const { ACTIONS } = require('../../utils/roles');

const router = express.Router();
const service = new ZonesService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchZoneSchema, 'query'),
  checkAuth({ route: 'zones', crud: ACTIONS.READ }),
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
  checkAuth({ route: 'zones', crud: ACTIONS.READ }),
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
  checkAuth({ route: 'zones', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const user = req.user
      const createdById = user.sub;
      const body = req.body;
      body.createdById = createdById;
      
      const newZone = await service.create(body);
      res.status(201).json(newZone);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  checkUser(),
  validatorHandler(getZoneSchema, 'params'),
  validatorHandler(updateZoneSchema, 'body'),
  checkAuth({ route: 'zones', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const zone = await service.update(id, body);
      res.json(zone);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  checkUser(),
  validatorHandler(getZoneSchema, 'params'),
  checkAuth({ route: 'zones', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(202).json({
        message: 'zone remove',
        id,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
