const express = require('express');

const usersRouter = require('./users.route');
const authRouter = require('./auth.route');

function routerApi(app) {
  const router = express.Router();
  app.use('/v1', router);
  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
}

module.exports = routerApi;
