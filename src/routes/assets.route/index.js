const express = require('express');
const passport = require('passport');

// Imports helpers

const AssetsService = require('../../services/asset.service');
const LogService = require('../../services/log.service');
const MovementService = require('../../services/order.service/movement.service');
const OrderRecordService = require('../../services/order.service');
const { GeoAssetServices } = require('../../services/geo.service');

// Middlewares
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const { upload } = require('../../middlewares/upload.handler');

// Utils
const { generateExcel } = require('../../helpers/toExcel.helper');
const { ACTIONS, SCOPE } = require('../../utils/roles');
const { parseCSV } = require('../../helpers/parseCSV.helper');

// Validators schema

const validatorHandler = require('../../middlewares/validator.handler');
const {
  updateAssetSchema,
  getAssetSchema,
  searchAsset,
  createBulkAssetSchema,
  importAssetSchema,
  deleteAssetSchema,
  updateAssetSpecificationSchema,
} = require('../../schemas/asset.schema');
const {
  searchMovementSchema,
} = require('../../schemas/order.schema/movement.schema');
const {
  findGeoAssetSchema,
} = require('../../schemas/geo.schema/geo-asset.schema');

// import routes

const modelRoute = require('./model.route');
const {
  assetSpecification,
} = require('../../schemas/category.schema/specification.schema');

const router = express.Router();

// Services
const service = new AssetsService();
const logService = new LogService();
const orderService = new OrderRecordService();
const movementService = new MovementService();
const geoService = new GeoAssetServices();

router.use('/models', modelRoute);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchAsset, 'query'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    const toSearch = req.query;
    toSearch.type = 'asset';
    try {
      const assets = await service.find({
        ...toSearch,
        groupId: req.groupId,
      });
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
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      query.type = 'asset';

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
          'fecha de eliminación',
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
  '/tag',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const tag = await service.getTag('gana');
      res.json(tag);
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
  checkAuth({ route: SCOPE.ASSETS, crud: 'read' }),
  async (req, res, next) => {
    try {
      const { groupId } = req;
      const { id } = req.params;
      const asset = await service.findOne({
        id,
        type: 'asset',
        groupId,
        paranoid: false,
      });
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/logs',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: SCOPE.ASSETS, crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      await service.findOne({
        id,
        groupId: req.groupId,
        paranoid: false,
      });

      const logs = await logService.find({
        table: 'assets',
        targetId: id,
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/geo',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(findGeoAssetSchema, 'query'),
  checkAuth({ route: SCOPE.ASSETS, crud: 'read' }),
  async (req, res, next) => {
    try {
      const { query } = req.query;
      const { id } = req.params;
      const asset = await service.findOne({
        id,
        paranoid: false,
        type: 'asset',
        groupId: req.groupId,
      });
      const geo = await geoService.find({
        ...query,
        serial: asset.serial,
      });
      res.status(200).json(geo);
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/:id/specifications',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: SCOPE.ASSETS, crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.findOne({
        id,
        groupId: req.groupId,
        paranoid: false,
      });

      const specs = await service.getSpecifications({
        id,
        groupId: req.groupId,
      });
      res.json(specs);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/maintenances',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: SCOPE.ASSETS, crud: 'read' }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      await service.findOne({
        id,
        groupId: req.groupId,
        paranoid: false,
      });

      const specs = await service.getMaintenance({
        id,
      });
      res.json(specs);
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
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const { assets, description, notes, content } = req.body;

      const user = req.user;

      const targets = [];

      const newAssets = await service.createBulk({
        assets,
        user,
        groupId: req.groupId,
      });

      for (const asset of newAssets.created) {
        const details = {
          message: `Se ha creado el activo ${asset.serial}`,
        };

        targets.push({
          quantity: '1',
          locationId: asset.locationId,
          assetId: asset.id,
        });

        await logService.create({
          type: ACTIONS.CREATE,
          table: 'assets',
          targetId: asset.id,
          details,
          ip: req.ip,
          createdById: user.sub,
        });
      }
      const data = {
        targets,
        locationId: null,
        type: 'checking',
        description,
        notes,
        content,
        createdById: user.sub,
      };

      await orderService.createAssignments(data);

      res.status(201).json(newAssets);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/import',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  upload.single('assets'),
  validatorHandler(importAssetSchema, 'body'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const { description, notes, content } = req.body;

      const user = req.user;
      const path = req.file.path;
      const assets = await parseCSV(path, ',', user.sub);
      const newAssets = await service.createBulk({ assets, user });
      const targets = [];

      for (const asset of newAssets.created) {
        const details = {
          message: `Se ha creado el activo ${asset.dataValues.serial}`,
        };

        targets.push({
          quantity: '1',
          locationId: asset.dataValues.locationId,
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
        locationId: null,
        type: 'checking',
        description,
        notes,
        content,
        createdById: user.sub,
      };

      const order = await orderService.createAssignments(data);

      res.status(201).json({
        message: 'Se han importado ' + newAssets.created.length + ' activos',
      });
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
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user = req.user;
      body.updatedById = user.sub;
      const asset = await service.update(id, body, req.groupId);

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

router.patch(
  '/:id/specifications',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(assetSpecification, 'body'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user = req.user;
      body.updatedById = user.sub;

      await service.findOne({
        id,
        groupId: req.groupId,
        paranoid: false,
      });

      const spec = await service.updateSpecification({
        id,
        changes: body,
        userId: user.sub,
      });

      const details = {
        message: `Se ha modificado el activo `,
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
      res.status(201).json(spec);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/restore',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(deleteAssetSchema, 'body'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user = req.user;

      const asset = await service.restore({ id });

      const details = {
        message: `Se ha restaurado el activo ${asset.dataValues.serial} motivado a ${message}`,
      };
      await logService.create({
        type: ACTIONS.RECOVERY,
        table: 'assets',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(202).json({
        message: 'Has restaurado ' + asset.serial,
        target: asset,
      });
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
  validatorHandler(deleteAssetSchema, 'body'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user = req.user;

      const asset = await service.delete({
        id,
        deletedById: user.sub,
        groupId: req.groupId,
      });

      const details = {
        message: `Se ha ocultado el activo ${asset.dataValues.serial} motivado a ${message}`,
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

router.delete(
  '/:id/specifications',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetSchema, 'params'),
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      await service.findOne({
        id,
        groupId: req.groupId,
        paranoid: false,
      });

      const spec = await service.removeSpecification({
        id,
        typeId: req.body.typeId,
      });

      const details = {
        message: `Se ha eliminado la especificación del activo`,
      };

      await logService.create({
        type: ACTIONS.DELETE,
        table: 'specifications',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(202).json({
        message: 'Has eliminado ',
        target: spec,
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
  checkAuth({ route: SCOPE.ASSETS, crud: ACTIONS.READ }),
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
