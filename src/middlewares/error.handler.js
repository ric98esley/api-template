const boom = require('@hapi/boom');
let colors = require('colors');
const { ValidationError, ForeignKeyConstraintError } = require('sequelize');

function logErrors(err, req, res, next) {
  console.error('log errors'.red);
  console.error(err);
  next(err);
}

function errorHandler(err, req, res, next) {
  console.error('error handler'.red);
  console.log(err);
  res.status(500).json({
    message: 'Ha ocurrido un error no controlado, por favor intente más tarde',
  });
}

function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    console.error('Boom error handler'.red);
    const { output } = err;
    output.payload.data = err.data;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
}

function handleSQLError(err, req, res, next) {
  if (err instanceof ValidationError) {
    console.error('SQL error handler'.red);
    console.error(err);
    if (err.original.code === 'ER_DUP_ENTRY') {
      const fields = err.errors.map((error) => error.value);
      throw boom.conflict('El registro ya existe en la base de datos: ' + fields.join(', '));
    }

    throw boom.conflict(
      'Ha ocurrido un error interno, por favor intente más tarde, si el problema persiste contacte al administrador del sistema'
    );
  } else {
    next(err);
  }
}

function handleFKError(err, req, res, next) {
  if (err instanceof ForeignKeyConstraintError) {
    console.error('FK error handler'.red);
    console.error(err);
    throw boom.conflict(
      'Por favor verifique que los datos relacionados existan o que no estén siendo referenciados por otro registro'
    );
  } else {
    next(err);
  }
}

module.exports = {
  logErrors,
  errorHandler,
  boomErrorHandler,
  handleSQLError,
  handleFKError,
};
