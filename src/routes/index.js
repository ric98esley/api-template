const express = require('express');

const usersRouter = require('./users.route');
const customerRouter = require('./users.route/customers.route');
const authRouter = require('./auth.route');
const categoriesRouter = require('./categories.route');
const brandsRouter = require('./brands.route');
const assetsRouter = require('./assets.route');
const warehouseRouter = require('./warehouse.route');
const locationRouter = require('./locations.route');
const groupsRouter = require('./groups.route');

function routerApi(app) {
  const router = express.Router();
  app.use('/v1', router);
  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/customers', customerRouter);
  router.use('/categories', categoriesRouter);
  router.use('/brands', brandsRouter);
  router.use('/assets', assetsRouter);
  router.use('/groups', groupsRouter);
  router.use('/warehouse', warehouseRouter);
  router.use('/locations', locationRouter);
}

module.exports = routerApi;
