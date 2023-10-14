const express = require('express');

// const usersRouter = require('./users.router');

function routerApi(app) {
  const router = express.Router();
  app.use('/v1', router);
  // router.use('/users', usersRouter);
}

module.exports = routerApi;
