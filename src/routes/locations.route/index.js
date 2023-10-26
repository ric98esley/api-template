const express = require('express');
const passport = require('passport');

const LocationsService = require('../../services/locations.service');
// const AssignmentService = require('../../services/orders.service/assignments.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkRoles, checkPermissions, checkAuth, checkUser } = require('../../middlewares/auth.handler');

const {
  updateLocationSchema,
  createLocationSchema,
  getLocationSchema,
  searchLocationSchema
} = require('../../schemas/location.schema');


const zoneRouter = require('./zones.route');
const locationType = require('./types.route');
// const { searchAssignmentSchema } = require('../../schemas/orders.schema');

const router = express.Router();
const locationService = new LocationsService();
// const assignmentsService = new AssignmentService();

router.use('/zones', zoneRouter);
router.use('/types', locationType);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchLocationSchema, 'query'),
  checkAuth({ route: 'users', crud: 'read' }),
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
  checkAuth({ route: 'users', crud: 'read' }),
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
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      // TODo: request for user id
      const user = req.user
      const createdById = user.sub;
      const body = req.body;
      body.createdById = createdById;

      const newLocation = await locationService.create(body);
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
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { groupId} = req.query;
      const { id } = req.params;
      const body = req.body;
      const location = await locationService.update({id, changes: body, groupId});
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
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await locationService.delete(id);
      res.status(202).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assets',
  passport.authenticate('jwt', { session: false }),
  // validatorHandler(searchAssignmentSchema, 'query'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      toSearch.locationId = id;
      toSearch.include = false;
      try {
        let assets = await assignmentsService.find2(toSearch);
        res.json(assets);
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id/assets/last',
  passport.authenticate('jwt', { session: false }),
  // validatorHandler(searchAssignmentSchema, 'query'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      toSearch.locationId = id;
      toSearch.include = false;
      try {
        let assets = await assignmentsService.find2(toSearch);
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
