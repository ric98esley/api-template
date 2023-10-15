const boom = require("@hapi/boom");
let colors = require('colors');
const { ValidationError,ForeignKeyConstraintError } = require("sequelize");

function logErrors(err, req, res, next) {
  console.error("log errors".red);
  console.error(err.red);
  next(err);
}

function errorHandler(err, req, res, next) {
  console.error("error handler".red);
  console.log(err)
  res.status(500).json({
    message: err.message,
  });
}

function boomErrorHandler(err, req, res, next) {
  
  if (err.isBoom) {
    console.error("Boom error handler".red);
    const { output } = err;
    res.status(output.statusCode).json({
      message: output.payload,
    });
  } else {
    next(err);
  }
}

function handleSQLError(err, req, res, next) {
  if (err instanceof ValidationError) {
    console.error("SQL error handler".red);
    throw boom.conflict(`${err.errors[0].message}: ${err.errors[0].value}`);
  } else {
    next(err);
  }
}

function handleFKError(err, req, res, next) {
  if (err instanceof ForeignKeyConstraintError) {
    console.error("FK error handler".red);
    throw boom.conflict(err);
  } else {
    next(err);
  }
}


module.exports = { logErrors, errorHandler, boomErrorHandler, handleSQLError, handleFKError };
