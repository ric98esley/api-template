const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const AssetsService = require('../../services/asset.service');
const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const OrderRecordService = require('../../services/order.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const { searchAsset, getAssetSchema } = require('../../schemas/asset.schema');

const router = express.Router();
const service = new AssetsService();
const logService = new LogService();
const orderService = new OrderRecordService();
const movementService = new MovementService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchAsset, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const toSearch = req.query;
      toSearch.type = 'consumable';
      const assets = await service.find(toSearch);
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/excel',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchAsset, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.type = 'consumable'

      const assets = await service.vFind(query);

      const workbook = await generateExcel({
        name: 'Consumibles',
        headingColumnNames: [
          'id',
          'Serial',
          'Categoría',
          'modelo',
          'marca',
          'Código de agencia',
          'Nombre agencia',
          'Grupo',
          'Status',
          'fecha',
        ],
        data: assets.rows,
        res,
      });

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const assets = await service.findOne({ id, type: 'consumable' });
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/')

module.exports = router;
