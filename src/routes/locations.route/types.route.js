const express = require('express');
const passport = require('passport');

const TypesServices = require('../../services/locations.service/type.service');
const LogService = require('../../services/log.service');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  createTypeLocation,
  searchType,
  getTypeLocation,
} = require('../../schemas/location.schema/type.schema');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

const locationTypeService = new TypesServices();
const logService = new LogService()

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchType, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS_TYPE, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
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
  checkAuth({ route: SCOPE.LOCATIONS_TYPE, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const body = req.body;
      body.createdById = user.sub;
      const newType = await locationTypeService.create(body);

      const details = {
        message: `Se ha creado el tipo ${newType.dataValues.name} - ${newType.dataValues.status}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.LOCATIONS_TYPE,
        targetId: newType.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

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
  checkAuth({ route: SCOPE.LOCATIONS_TYPE, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const body = req.body;
      const { id } = req.params;
      const type = await locationTypeService.update(id, body);

      const details = {
        message: `Se ha modificado el tipo ${type.dataValues.name}`,
        query: body,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.LOCATIONS_TYPE,
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(type);
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
  checkAuth({ route: SCOPE.LOCATIONS_TYPE, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const deleted = await locationTypeService.delete(id);

      const details = {
        message: `Se ha ocultado el tipo ${deleted.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.LOCATIONS_TYPE,
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json({ message: details.message, target: deleted });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
