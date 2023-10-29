const express = require('express');
const passport = require('passport');

const LocationsService = require('../../services/locations.service');
const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');


// const AssignmentService = require('../../services/orders.service/assignments.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkAuth, checkUser } = require('../../middlewares/auth.handler');

const {
  updateLocationSchema,
  createLocationSchema,
  getLocationSchema,
  searchLocationSchema
} = require('../../schemas/location.schema');


const zoneRouter = require('./zones.route');
const locationType = require('./types.route');
const { SCOPE, ACTIONS } = require('../../utils/roles');
const { searchMovementSchema } = require('../../schemas/order.schema/movement.schema');
// const { searchAssignmentSchema } = require('../../schemas/orders.schema');

const router = express.Router();
const movementService = new MovementService();
const locationService = new LocationsService();
const logService = new LogService()
// const assignmentsService = new AssignmentService();

router.use('/zones', zoneRouter);
router.use('/types', locationType);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchLocationSchema, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query
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
      const location = await locationService.findOne({id});
      res.json(location);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createLocationSchema, 'body'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      // TODo: request for user id
      const user = req.user
      const createdById = user.sub;
      const body = req.body;
      body.createdById = createdById;

      const newLocation = await locationService.create(body);

      const details = {
        message: `Se ha creado el lugar ${newLocation.dataValues.name} - ${newLocation.dataValues.code}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.LOCATIONS,
        targetId: newLocation.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(201).json(newLocation);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  validatorHandler(updateLocationSchema, 'body'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { groupId } = req.query;
      const { id } = req.params;
      const body = req.body;
      const location = await locationService.update({id, changes: body, groupId});

      const details = {
        message: `Se ha modificado el lugar ${location.dataValues.name}`,
        query: body
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: SCOPE.LOCATIONS,
        targetId: location.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.json(location);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLocationSchema, 'params'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const location = await locationService.delete(id);
      const details = {
        message: `Se ha creado el deposito ${location.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: SCOPE.LOCATIONS,
        targetId: location.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });

      res.status(202).json({
        message: details.message,
        target: location
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assets',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchMovementSchema, 'query'),
  checkAuth({ route: SCOPE.LOCATIONS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      toSearch.toId = id;
      toSearch.current = true
      try {
        let assets = await movementService.find(toSearch);
        res.json(assets);
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
