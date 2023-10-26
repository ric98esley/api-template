const express = require('express');
const passport = require('passport');

const TypesServices = require('../../services/locations.service/type.service');
const { checkRoles, checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  createTypeLocation,
  searchType,
  getTypeLocation,
} = require('../../schemas/location.schema/type.schema');

const router = express.Router();

const locationTypeService = new TypesServices();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchType, 'query'),
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const query = req.query;

      console.log(query)
      const types = await locationTypeService.find(query);

      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createTypeLocation, 'body'),
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.createdById = req.user.sub;
      const newType = await locationTypeService.create(body);

      res.status(201).json(newType);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getTypeLocation, 'params'),
  validatorHandler(createTypeLocation, 'body'),
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { id } = req.params;
      const newType = await locationTypeService.update(id, body);

      res.status(201).json(newType);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getTypeLocation, 'params'),
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await locationTypeService.delete(id);

      res.status(201).json(deleted);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
