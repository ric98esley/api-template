const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const LogService = require('../../services/log.service');
const LotService = require('../../services/consumable.service/lot.service');
const LocationsServices = require('../../services/locations.service');
const WarehouseService = require('../../services/consumable.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const { findConsumable } = require('../../schemas/consumable.schema');
const {
  searchLocationSchema,
  getLocationSchema,
} = require('../../schemas/location.schema');

const router = express.Router();
const lotService = new LotService();
const warehouseService = new WarehouseService();
const locationService = new LocationsServices();

const lotRoute = require('./lot.route');

router.use('/lots', lotRoute );

const { createLot } = require('../../schemas/consumable.schema/lot.schema');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchLocationSchema, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.status = 'desplegable';
      let locations = await locationService.find(query);
      res.json(locations);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      const location = await locationService.findOne({ id, groupId });
      res.json(location);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/products',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  validatorHandler(findConsumable, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = req.query;

      const location = await warehouseService.find({
        ...query,
        locationId: id,
      });
      res.json(location);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/checking',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  validatorHandler(createLot, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const createdById = user.sub;
      const body = req.body;
      const { targets = [] } = body;
      body.type = 'checking';
      body.createdById = createdById;

      const movements = [];

      for (const target of targets) {
        const product = await warehouseService.add({
          locationId: id,
          createdById,
          ...target,
        });
        if (product.error) {
        } else {
          const movement = {
            targetId: product.id,
            quantity: target.quantity,
          };

          movements.push(movement);
        }
      }

      const lot = await lotService.create({ ...body, movements });

      res.status(201).json(lot);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  '/:id/checkout',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  validatorHandler(createLot, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const createdById = user.sub;
      const body = req.body;
      const { targets = [] } = body;
      body.type = 'checkout';
      body.createdById = createdById;

      const movements = [];

      for (const target of targets) {
        const product = await warehouseService.sub({
          locationId: id,
          createdById,
          ...target,
        });

        if (product.error) {
        } else {
          const movement = {
            targetId: product.id,
            quantity: target.quantity,
          };

          movements.push(movement);
        }
      }

      const lot = await lotService.create({ ...body, movements });

      res.status(201).json(lot);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
