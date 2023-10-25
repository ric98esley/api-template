const express = require('express');
const passport = require('passport');

const HardwareSpecificationsServices = require('../../services/category.service/specification.service');
const LogService = require('../../services/log.service');

const logService = new LogService();

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const {
  searchSpecification,
  createSpecification,
  updateSpecification,
  getSpecification,
} = require('../../schemas/category.schema/specification.schema');
const { ACTIONS } = require('../../utils/roles');

const service = new HardwareSpecificationsServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchSpecification, 'query'),
  checkAuth({ route: 'specifications', crud: 'read' }),
  async (req, res, next) => {
    const toSearch = req.query;
    try {
      const specifications = await service.find(toSearch);

      res.json(specifications);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createSpecification, 'body'),
  checkAuth({ route: 'specifications', crud: 'create' }),
  async (req, res, next) => {
    try {
      const data = req.body;
      const user = req.user;

      const newSpecification = await service.create({
        data,
        user,
      });
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'specifications',
        targetId: newSpecification.dataValues.id,
        details: `Se ha creado ${newSpecification.dataValues.name}`,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(newSpecification);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getSpecification, 'params'),
  validatorHandler(updateSpecification, 'body'),
  checkAuth({ route: 'specifications', crud: 'update' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user;

      const newSpecification = await service.update({
        data,
        user,
        id,
      });

      const details = {
        message: `Se ha modificado la especificación`,
        query: data,
      };

      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'specifications',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(newSpecification);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getSpecification, 'params'),
  checkAuth({ route: 'specifications', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const specification = await service.findOne({
        id,
      });
      res.json(specification);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getSpecification, 'params'),
  checkAuth({ route: 'specifications', crud: 'delete' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const specification = await service.delete({
        id,
        user,
      });

      await logService.create({
        type: ACTIONS.DELETE,
        table: 'specifications',
        targetId: id,
        details: 'Se ha ocultado la especificación',
        ip: req.ip,
        createdById: user.sub,
      });
      res.json({ message: 'se ha ocultado la especificación', target: specification });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
