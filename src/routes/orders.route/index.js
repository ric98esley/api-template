const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

const LogService = require('../../services/log.service');
const OrderRecordService = require('../../services/order.service');
const MovementService = require('../../services/order.service/movement.service');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const { createOrderRecordSchema, searchOrderRecordSchema, getOrderRecordSchema, createCheckingRecordSchema } = require('../../schemas/order.schema');
const { getMovementSchema, searchMovementSchema } = require('../../schemas/order.schema/movement.schema');

const logService = new LogService();
const orderService = new OrderRecordService();
const movementService = new MovementService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchOrderRecordSchema, 'body'),
  checkAuth({ route: SCOPE.ORDERS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {

      const query = req.query;
      const orders = await orderService.find(query);

      res.json(orders)
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getOrderRecordSchema, 'params'),
  checkAuth({ route: SCOPE.ORDERS, crud: ACTIONS.CHECKOUT }),
  async (req, res, next) => {
    try {

      const { id } = req.params
      const order = await orderService.findOne({id})

      res.json(order)
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id/movements',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getOrderRecordSchema, 'params'),
  validatorHandler(searchMovementSchema, 'query'),
  checkAuth({ route: SCOPE.ORDERS, crud: ACTIONS.CHECKOUT }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const queries = req.query;

      const movements = await movementService.find({...queries, orderId: id, all: true, paranoid: true});

      res.json(movements);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/checkout',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createOrderRecordSchema, 'body'),
  checkAuth({ route: SCOPE.ORDERS, crud: ACTIONS.CHECKOUT }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const data = req.body;

      data.createdById = user.sub;
      data.type = 'checkout';

      const order = await orderService.createAssignments(data);

      const details = {
        message: `Se ha creado una nueva order de salida`,
        query: data,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.ORDERS,
        targetId: order.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/checking',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createCheckingRecordSchema, 'body'),
  checkAuth({ route: SCOPE.ORDERS, crud: ACTIONS.CHECKING }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const data = req.body;

      data.createdById = user.sub;
      data.type = 'checking';

      const order = await orderService.createAssignments(data);

      const details = {
        message: `Se ha creado una nueva order de entrada`,
        query: data,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.ORDERS,
        targetId: order.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
