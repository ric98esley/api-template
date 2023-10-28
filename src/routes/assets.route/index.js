const express = require('express');
const passport = require('passport');

// Imports helpers

const AssetsService = require('../../services/asset.service');
const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const OrderRecordService = require('../../services/order.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

// import routes

const modelRoute = require('./model.route');

const {
  updateAssetSchema,
  getAssetSchema,
  searchAsset,
  createBulkAssetSchema,
} = require('../../schemas/asset.schema');
const { generateExcel } = require('../../helpers/toExcel.helper');
const { ACTIONS } = require('../../utils/roles');
const {
  searchMovementSchema,
} = require('../../schemas/order.schema/movement.schema');

const router = express.Router();
const service = new AssetsService();
const logService = new LogService();
const orderService = new OrderRecordService();
const movementService = new MovementService();

router.use('/models', modelRoute);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchAsset, 'query'),
  checkAuth({ route: 'assets', crud: ACTIONS.READ }),
  async (req, res, next) => {
    const toSearch = req.query;
    try {
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
  checkAuth({ route: 'assets', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.type = 'asset'

      const assets = await service.vFind(query);

      const workbook = await generateExcel({
        name: 'Activos',
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
  checkAuth({ route: 'assets', crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const asset = await service.findOne({
        id,
      });
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createBulkAssetSchema, 'body'),
  checkAuth({ route: 'assets', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const { assets, locationId, description, notes, content } = req.body;

      const user = req.user;

      const targets = [];

      const newAssets = await service.createBulk({ assets, locationId, user });

      for (const asset of newAssets.created) {
        const details = {
          message: `Se ha creado el activo ${asset.dataValues.serial}`,
        };

        targets.push({
          quantity: '1',
          assetId: asset.dataValues.id,
        });

        await logService.create({
          type: ACTIONS.CREATE,
          table: 'assets',
          targetId: asset.dataValues.id,
          details,
          ip: req.ip,
          createdById: user.sub,
        });
      }
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

      res.status(201).json(newAssets);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(updateAssetSchema, 'body'),
  checkAuth({ route: 'assets', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user = req.user;
      body.updatedById = user.sub;
      const asset = await service.update(id, body);

      const details = {
        message: `Se ha modificado el activo ${asset.dataValues.serial}`,
        query: body,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'assets',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: 'assets', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const asset = await service.delete({ id, deletedById: user.sub });

      const details = {
        message: `Se ha ocultado el activo ${asset.dataValues.serial}`,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: 'assets',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(202).json({
        message: 'Has ocultado ' + asset.serial,
        target: asset,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/movements',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchMovementSchema, 'query'),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: 'assets', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      toSearch.assetId = id;
      toSearch.all = true;

      let movements = await movementService.find(toSearch);

      res.json(movements);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
