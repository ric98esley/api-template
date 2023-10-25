const express = require('express');
const passport = require('passport');
const { checkUser, checkAuth } = require('../../../middlewares/auth.handler');
const validatorHandler = require('../../../middlewares/validator.handler');

const {
  searchCustomerSchema,
  createCustomerSchema,
  getCustomerSchema,
  updateCustomerSchema,
} = require('../../../schemas/user.schema/customer.schema');
const CustomersServices = require('../../../services/user.service/customer.service');
const LogService = require('../../../services/log.service');
const { ACTIONS } = require('../../../utils/roles');
const {
  getUserSchema,
  searchUserSchema,
} = require('../../../schemas/user.schema');

const costumerService = new CustomersServices();
const logService = new LogService();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchCustomerSchema, 'query'),
  checkAuth({ route: 'customers', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const toSearch = req.query;
      let users = await costumerService.find(toSearch);

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getUserSchema, 'params'),
  checkAuth({ route: 'customers', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      let users = await costumerService.findOne({ id });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createCustomerSchema, 'body'),
  checkAuth({ route: 'customers', crud: 'create' }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const toCreate = req.body;
      let newCustomer = await costumerService.create(toCreate);

      await logService.create({
        type: ACTIONS.CREATE,
        table: 'customers',
        targetId: newCustomer.dataValues.id,
        details: `El usuario ${newCustomer.dataValues.name} ha creado un perfil`,
        ip: req.ip,
        createdById: user.sub,
      });
      res.json(newCustomer);
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getCustomerSchema, 'params'),
  validatorHandler(updateCustomerSchema, 'body'),
  checkAuth({ route: 'customers', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const user = req.user;

      const toUpdate = req.body;
      const { id } = req.params

      let updateCustomer = await costumerService.update({ id , changes : toUpdate});

      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'customers',
        targetId: updateCustomer.dataValues.id,
        details: `El cliente ${updateCustomer.dataValues.name} ha modificado un perfil`,
        ip: req.ip,
        createdById: user.sub,
      });

      res.json(updateCustomer);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getCustomerSchema, 'params'),
  checkAuth({ route: 'customers', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const user = req.user;

      const { id } = req.params;
      let customer = await costumerService.delete({ id });

      await logService.create({
        type: ACTIONS.DELETE,
        table: 'customers',
        targetId: id,
        details: `El cliente ${customer.dataValues.name} se ha oculto un perfil`,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(202).json({
        message: 'Haz ocultado el perfil',
        target: customer,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
