const express = require('express');
const passport = require('passport');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();

const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  searchMovementSchema,
} = require('../../schemas/order.schema/movement.schema');
const { generateExcel } = require('../../helpers/toExcel.helper');
const logService = new LogService();
const movementService = new MovementService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchMovementSchema, 'query'),
  checkAuth({ route: SCOPE.MOVEMENTS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.all = true;
      const movements = await movementService.find(query);

      res.json(movements);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/excel',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchMovementSchema, 'query'),
  checkAuth({ route: SCOPE.MOVEMENTS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.all = true;
      const movements = await movementService.vFind(query);

      const workbook = await generateExcel({
        name: 'Activos',
        headingColumnNames: [
          'id',
          'lote',
          'serial',
          'modelo',
          'categoría',
          'marca',
          'Proviene de',
          '',
          'Lugar objetivo',
          '',
          'Grupo',
          '',
          'Tipo',
          'Descripción',
          'Esta activo (1 verdadero 0 falso)',
          'Movimiento creado por',
        ],
        data: movements.rows,
        res,
      });

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });

      res.json(movements);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/locations',
  async (req, res, next) => {
  try {
    const query = req.query;
    const locations = await movementService.getByLocations(query);

    res.json(locations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
