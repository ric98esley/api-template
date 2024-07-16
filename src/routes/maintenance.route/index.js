const express = require('express');
const passport = require('passport');

const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

router.use('/types', require('./maintenance_type.route'));

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: SCOPE.MAINTENANCES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      res.status(200).json('Get all maintenance');
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;
