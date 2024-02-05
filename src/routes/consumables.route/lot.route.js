const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const LogService = require('../../services/log.service');
const LotService = require('../../services/consumable.service/lot.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const { findLot, getLot } = require('../../schemas/consumable.schema/lot.schema');

const router = express.Router();
const logService = new LogService();
const lotService = new LotService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findLot, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;

      const lots = await lotService.find(query);

      res.json(lots);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getLot, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const lot = await lotService.findOne({ id });

      res.json(lot);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
