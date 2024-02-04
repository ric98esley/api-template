const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const LogService = require('../../services/log.service');
const LotService = require('../../services/consumable.service/lot.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const { createLot } = require('../../schemas/consumable.schema/lot.schema');

const router = express.Router();
const logService = new LogService();
const lotService = new LotService();

router.post(
  '/checking',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createLot, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const createdById = user.sub;
      const body = req.body;
      body.type = 'checking';
      body.createdById = createdById;

      console.log(req.params)


      const lot = await lotService.create(body)

      res.status(201).json(lot)
    } catch (error) {
      next(error)
    }
  }
);

module.exports = router;
