const express = require('express');
const passport = require('passport');

const ModelServices = require('../../services/asset.service/model.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkRoles } = require('../../middlewares/auth.handler');

const {
  createAssetModel,
  updateAssetModel,
  getAssetModel,
  searchModel,
} = require('../../schemas/asset.schema/model.schema');

const service = new ModelServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchModel, 'query'),
  async (req, res, next) => {
    try {
      const data = req.query;
      const model = await service.find(data);
      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(createAssetModel, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      body.createdById = user.sub;

      const newModel = await service.create(body);
      res.status(201).json(newModel);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssetModel, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const Model = await service.findOne(id);
      res.json(Model);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssetModel, 'params'),
  validatorHandler(updateAssetModel, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const Model = await service.update(id, body);
      res.json(Model);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssetModel, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete({ id });
      res.status(202).json({
        msg: 'Model deleted ' + id,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
