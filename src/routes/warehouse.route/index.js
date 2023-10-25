const express = require('express');
const passport = require('passport');

const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const {
  createWarehouse,
  getWarehouse,
  updateWarehouse,
  searchWarehouse
} = require('../../schemas/warehouse.schema');
const WarehouseService = require('../../services/warehouse.service');
const LogService = require('../../services/log.service');
const { ACTIONS } = require('../../utils/roles');

const logService = new LogService()
const service = new WarehouseService();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchWarehouse, 'query'),
  checkAuth({ route: 'warehouses', crud: ACTIONS.READ }),
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
  checkUser(),
  validatorHandler(createWarehouse, 'body'),
  checkAuth({ route: 'warehouses', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      body.createdById = user.sub;
      const newWarehouse = await service.create(body);

      const details = {
        message: `Se ha creado el deposito ${newWarehouse.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'warehouses',
        targetId: newWarehouse.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });

      res.status(201).json(newWarehouse);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getWarehouse, 'params'),
  checkAuth({ route: 'warehouses', crud: 'read' }),
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
  checkUser(),
  validatorHandler(getWarehouse, 'params'),
  validatorHandler(updateWarehouse, 'body'),
  checkAuth({ route: 'warehouses', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user
      const body = req.body;
      const warehouse = await service.update(id, body);

      const details = {
        message: `Se ha modificado el deposito`,
        query: body,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'warehouses',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.json(warehouse);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getWarehouse, 'params'),
  checkAuth({ route: 'warehouses', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);

      const details = {
        message: `Se ha ocultado deposito`,
        query: data,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: 'warehouses',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(202).json({
        msg: 'Warehouse deleted ' + id,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
