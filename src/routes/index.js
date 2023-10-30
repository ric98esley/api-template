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
const orderRouter = require('./orders.route');
const movementsRouter = require('./orders.route/movements.route');
const consumablesRouter = require('./consumables.route');
const productsRouter = require('./consumables.route/products.route');

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
  router.use('/warehouses', warehouseRouter);
  router.use('/locations', locationRouter);
  router.use('/orders', orderRouter);
  router.use('/movements', movementsRouter);
  router.use('/consumables', consumablesRouter);
  router.use('/products', productsRouter);
}

module.exports = routerApi;
