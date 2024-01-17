const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const AssetsService = require('../../services/asset.service');
const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const OrderRecordService = require('../../services/order.service');

const { SCOPE, ACTIONS } = require('../../utils/roles');
const { searchAsset, getAssetSchema, createBulkAssetSchema } = require('../../schemas/asset.schema');
const WarehouseService = require('../../services/consumable.service');
const { findConsumable, createWarehouseProduct } = require('../../schemas/consumable.schema');

const router = express.Router();
const service = new AssetsService();
const logService = new LogService();
const orderService = new OrderRecordService();
const movementService = new MovementService();
const warehouseService = new WarehouseService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findConsumable, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const toSearch = req.query;
      const assets = await warehouseService.find(toSearch);
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

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createWarehouseProduct, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { locationId, description , content , notes, ...product } = body;

      const user = req.user;
      const createdById = user.sub

      const targets = [];

      const newAsset = await warehouseService.create({ ...product, locationId, createdById });

        const details = {
          message: `Se ha agregado el consumible`,
        };

      targets.push({
        quantity: product.quantity,
        assetId: newAsset.dataValues.productId,
      });

      await logService.create({
        type: ACTIONS.CREATE,
        table: 'consumables',
        targetId: newAsset.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      const data = {
        targets,
        locationId,
        type: 'checking',
        description,
        notes,
        content,
        createdById: user.sub,
      };

      const order = await orderService.createAssignments(data);

      res.status(201).json(newAsset);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
