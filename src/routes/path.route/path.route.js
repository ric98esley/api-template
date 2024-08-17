const express = require('express');
const passport = require('passport');
const route = express.Router();

const { ACTIONS, SCOPE } = require('../../utils/roles');
const validatorHandler = require('../../middlewares/validator.handler');
const PathService = require('../../services/path.service/path.service');

const {
  findPathsSchema,
  getPathSchema,
  updatePathSchema,
} = require('../../schemas/path.schema/path.schema');
const { checkAuth } = require('../../middlewares/auth.handler');

const pathService = new PathService();

route.get(
  '/',
  validatorHandler(findPathsSchema, 'query'),
  async (req, res, next) => {
    try {
      const query = req.query;

      const paths = await pathService.find(query);

      res.status(200).json(paths);
    } catch (error) {
      next(error);
    }
  }
);

route.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkAuth({ route: SCOPE.PATHS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;

      const path = await pathService.create(body);

      res.status(200).json(path);
    } catch (error) {
      next(error);
    }
  }
);

route.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getPathSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const path = await pathService.findOne(id);

      res.status(200).json(path);
    } catch (error) {
      next(error);
    }
  }
);

route.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getPathSchema, 'params'),
  validatorHandler(updatePathSchema, 'body'),
  checkAuth({ route: SCOPE.PATHS, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;

      const path = await pathService.update(id, body);

      res.status(200).json(path);
    } catch (error) {
      next(error);
    }
  }
);

route.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getPathSchema, 'params'),
  checkAuth({ route: SCOPE.PATHS, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      await pathService.delete(id);

      res.status(200).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = route;
