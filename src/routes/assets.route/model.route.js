const express = require('express');
const passport = require('passport');

const ModelServices = require('../../services/asset.service/model.service');
const LogService = require('../../services/log.service');

const validatorHandler = require('../../middlewares/validator.handler');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');

const {
  createAssetModel,
  updateAssetModel,
  getAssetModel,
  searchModel,
} = require('../../schemas/asset.schema/model.schema');
const { ACTIONS } = require('../../utils/roles');

const service = new ModelServices();
const logService = new LogService()

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchModel, 'query'),
  checkAuth({ route: 'models', crud: ACTIONS.READ }),
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
  checkUser(),
  validatorHandler(createAssetModel, 'body'),
  checkAuth({ route: 'models', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      body.createdById = user.sub;

      const newModel = await service.create(body);

      const details = {
        message: `Se ha creado el modelo ${newModel.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'models',
        targetId: newModel.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(201).json(newModel);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetModel, 'params'),
  checkAuth({ route: 'models', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const model = await service.findOne(id);
      res.json(model);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetModel, 'params'),
  validatorHandler(updateAssetModel, 'body'),
  checkAuth({ route: 'models', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      const model = await service.update(id, body);

      const details = {
        message: `Se ha modificado el modelo ${model.dataValues.name}`,
        query: body,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'models',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.json(model);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getAssetModel, 'params'),
  checkAuth({ route: 'models', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user
      const model = await service.delete({ id });

      const details = {
        message: `Se ha eliminado el modelo ${model.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: 'models',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub
      });
      res.status(202).json({
        message: 'Model deleted ' + model.dataValues.name,
        target: model
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
