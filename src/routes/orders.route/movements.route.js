const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  searchMovementSchema,
} = require('../../schemas/order.schema/movement.schema');
const logService = new LogService();
const movementService = new MovementService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchMovementSchema, 'query'),
  checkAuth({ route: SCOPE.MOVEMENTS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.all = true;
      const movements = await movementService.find(query);

      res.json(movements);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
