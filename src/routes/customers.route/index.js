const express = require('express');
const passport = require('passport');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const { searchCustomerSchema } = require('../../schemas/customer.schema');
const CustomersServices = require('../../services/user.service/customer.service');

const costumerService = new CustomersServices()

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchCustomerSchema, 'query'),
  checkAuth({ route: 'customer', crud: 'read' }),
  async (req, res, next) => {
    try {
      const toSearch = req.query;
      let users = await costumerService.find(toSearch);

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;