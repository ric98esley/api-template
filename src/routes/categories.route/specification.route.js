const express = require('express');
const passport = require('passport');

const HardwareSpecificationsServices = require('../../services/category.service/specification.service');

const validatorHandler = require('../../middlewares/validator.handler');
const {
  checkUser,
  checkAuth,
} = require('../../middlewares/auth.handler');
const {
  searchSpecification,
  createSpecification,
  updateSpecification,
  getSpecification,
} = require('../../schemas/category.schema/specification.schema');

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
      const { name } = req.body;
      const user = req.user;

      const newSpecification = await service.create({
        data: {
          name,
        },
        user,
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
      const { name } = req.body;
      const user = req.user;

      const newSpecification = await service.update({
        data: {
          name,
        },
        user,
        id,
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
      res.json(specification);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
