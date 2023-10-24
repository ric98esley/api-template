const express = require('express');

const usersRouter = require('./users.route');
const customerRouter = require('./users.route/customers.route');
const authRouter = require('./auth.route');
const categoriesRouter = require('./categories.route');

function routerApi(app) {
  const router = express.Router();
  app.use('/v1', router);
  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/customers', customerRouter);
  router.use('/categories', categoriesRouter);
}

module.exports = routerApi;
