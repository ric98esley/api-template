const express = require('express');
const passport = require('passport');

// Imports helpers

const AssetsService = require('../../services/asset.service');
const validatorHandler = require('../../middlewares/validator.handler');
const { checkPermissions } = require('../../middlewares/auth.handler');

// import routes

const modelRoute = require('./model.route');

const {
  updateAssetSchema,
  getAssetSchema,
  searchAsset,
  createBulkAssetSchema,
} = require('../../schemas/asset.schema');
// const AssignmentService = require('../../services/orders.service/assignments.service');
const { generateExcel } = require('../../helpers/toExcel.helper');

const router = express.Router();
const service = new AssetsService();
// const invoiceService = new InvoicesService();
// const assignmentsService = new AssignmentService();

// router.use('/history', historyRoute);
router.use('/models', modelRoute);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchAsset, 'query'),
  checkPermissions,
  async (req, res, next) => {
    const toSearch = req.query;
    try {
      let Assets = await service.find(toSearch);
      res.json(Assets);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/excel',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchAsset, 'query'),
  checkPermissions,
  async (req, res, next) => {
    try {

      const query = req.query;

      const assets = await service.vFind(query);

      const workbook = await generateExcel({
        name: 'Activos',
        headingColumnNames: ['id', 'Serial', 'Categoría', 'modelo', 'marca', 'Código de agencia', 'fecha'],
        data: assets.rows,
        res
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
  validatorHandler(getAssetSchema, 'params'),
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
  validatorHandler(createBulkAssetSchema, 'body'),
  async (req, res, next) => {
    try {
      const { assets, invoice, invoiceId} = req.body;
      const user = req.user;

      const newAssets = await service.createBulk({ assets, user });

      if(invoiceId) {
        const assetIds = newAssets.created.map((asset) => {
          return asset.id;
        });
        await invoiceService.addAssets({
          id: invoiceId,
          assets: assetIds,
          userId: user.sub
        });
      }
      if (invoice) {
        invoice.createdById = user.sub;
        const assetIds = newAssets.created.map((asset) => {
          return asset.id;
        });
        console.log(assetIds)
        const newInvoice = await invoiceService.create(invoice);
        await invoiceService.addAssets({
          id: newInvoice.id,
          assets: assetIds,
          userId: user.sub
        });
      }
      res.status(201).json(newAssets);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),

  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(updateAssetSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const user = req.user;
      body.updatedById = user.sub;
      const asset = await service.update(id, body);
      res.json(asset);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssetSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const asset = await service.delete({ id, deletedById: user.sub });

      res.status(202).json({
        message: 'Has ocultado ' + asset.serial,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assets',
  passport.authenticate('jwt', { session: false }),

  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(searchAsset, 'query'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { limit, offset } = req.query;

      const assigned = await service.findAssigned({ id, limit: Number(limit), offset: Number(offset) });
      res.json(assigned);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assignments',
  passport.authenticate('jwt', { session: false }),

  validatorHandler(getAssetSchema, 'params'),
  validatorHandler(searchAsset, 'query'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      toSearch.targetId = id;
      toSearch.include = true;
      toSearch.all = true;

      let assignments = await assignmentsService.find2(toSearch);


      // const assignments = await service.findAssigments({ id, limit: Number(limit), offset: Number(offset) });
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;
