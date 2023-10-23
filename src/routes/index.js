const express = require('express');

const usersRouter = require('./users.route');
const customerRouter = require('./customers.route');
const authRouter = require('./auth.route');

function routerApi(app) {
  const router = express.Router();
  app.use('/v1', router);
  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/customers', customerRouter);
}

module.exports = routerApi;
