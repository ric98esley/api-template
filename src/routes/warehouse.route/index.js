const express = require('express');
const passport = require('passport');

const { checkPermissions } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const {
  createWarehouse,
  getWarehouse,
  updateWarehouse,
  searchWarehouse
} = require('../../schemas/warehouse.schema');
const WarehouseService = require('../../services/warehouse.service');

const service = new WarehouseService();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchWarehouse, 'query'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const toSearch = req.query
      const status = await service.find(toSearch);
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(createWarehouse, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      body.createdById = user.sub;

      const newWarehouse = await service.create(body);
      res.status(201).json(newWarehouse);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getWarehouse, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const warehouse = await service.findOne(id);
      res.json(warehouse);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getWarehouse, 'params'),
  validatorHandler(updateWarehouse, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const warehouse = await service.update(id, body);
      res.json(warehouse);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getWarehouse, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(202).json({
        msg: 'Warehouse deleted ' + id,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
