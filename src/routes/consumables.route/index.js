const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const ProductHistoryService = require('../../services/consumable.service/history');
const LotService = require('../../services/consumable.service/lot.service');
const LocationsServices = require('../../services/locations.service');
const WarehouseService = require('../../services/consumable.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const {
  findConsumable,
  getConsumable,
  updateConsumable,
} = require('../../schemas/consumable.schema');

const {
  searchLocationSchema,
  getLocationSchema,
} = require('../../schemas/location.schema');

const {
  findLot,
  getLot,
} = require('../../schemas/consumable.schema/lot.schema');


const router = express.Router();
const lotService = new LotService();
const historyService = new ProductHistoryService();
const warehouseService = new WarehouseService();
const locationService = new LocationsServices();

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
      const { groupId } = req;
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

      await locationService.findOne({
        id,
        groupId: req.groupId,
      });

      const items = await warehouseService.find({
        ...query,
        locationId: id,
        groupId: req.groupId,
      });

      res.json(items);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id/movements',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  validatorHandler(findConsumable, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = req.query;

      await locationService.findOne({
        id,
        groupId: req.groupId,
      });

      const items = await historyService.find({
        ...query,
        locationId: id,
      });
      res.json(items);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/lots',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findLot, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      const { id } = req.params;

      const lots = await lotService.find({ locationId: id, ...query });

      res.json(lots);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/lots/:lotId',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLot, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { lotId, id } = req.params;
      const query = req.query;
      const lot = await lotService.findOne({
        id: lotId,
        locationId: id,
        query,
      });

      res.json(lot);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/lots/:lotId/movements',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLot, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { lotId, id } = req.params;
      const query = req.query;
      const movements = await lotService.findMovements({
        id: lotId,
        locationId: id,
        query,
      });

      res.json({
        total: movements.length,
        rows: movements,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/products/:productId',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getConsumable, 'params'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id, productId } = req.params;
      const query = req.query;

      await locationService.findOne({
        id,
        groupId: req.groupId,
      });

      const item = await warehouseService.findOne({
        locationId: id,
        id: productId,
      });
      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/products/:productId',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getConsumable, 'params'),
  validatorHandler(updateConsumable, 'body'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id, productId } = req.params;

      const body = req.body;

      await locationService.findOne({
        id,
        groupId: body.groupId,
      });

      const item = await warehouseService.update({
        locationId: id,
        id: productId,
        changes: body,
      });
      res.json(item);
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
      body.locationId = id;

      const movements = [];

      await locationService.findOne({
        id,
        groupId: body.groupId,
      });

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
      body.locationId = id;

      const movements = [];

      await locationService.findOne({
        id,
        groupId: body.groupId,
      });

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
