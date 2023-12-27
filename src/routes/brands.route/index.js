const express = require('express');
const passport = require('passport');

const BrandsServices = require('../../services/brand.service');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  createBrand,
  searchBrand,
  getBrand,
} = require('../../schemas/brand.schema');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const { upload } = require('../../middlewares/upload.handler');
const { parseCSV } = require('../../helpers/parseCSV.helper');
const { ACTIONS, SCOPE } = require('../../utils/roles');

const LogService = require('../../services/log.service');
const logService = new LogService();

const service = new BrandsServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchBrand, 'query'),
  checkAuth({ route: 'brands', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const queries = req.query;
      const brands = await service.find(queries);

      res.status(200).json(brands);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createBrand, 'body'),
  checkAuth({ route: 'brands', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      body.createdById = req.user.sub;

      const brand = await service.create(body);

      const details = {
        message: `Se ha creado la marca ${brand.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'brands',
        targetId: brand.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(brand);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/import',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: SCOPE.BRANDS, crud: ACTIONS.IMPORT }),
  upload.single('brands'),
  async (req, res, next) => {
    try {
      const user = req.user;
      const filePath = req.file.path;

      const csvData = await parseCSV(filePath, ',', user.sub);

      const brands = await service.createMany(csvData);

      for (const brand of brands) {
        const details = {
          message: `Se ha importado la marca ${brand.dataValues.name}`,
        };
        await logService.create({
          type: ACTIONS.CREATE,
          table: 'brands',
          targetId: brand.dataValues.id,
          details,
          ip: req.ip,
          createdById: user.sub,
        });
      }

      res.status(201).json({
        message: `se han creado ${brands.length} marcas`
      });
    } catch (error) {
      next(error);
    }
  });

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getBrand, 'params'),
  validatorHandler(createBrand, 'body'),
  checkAuth({ route: 'brands', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user;

      const brand = await service.update({ id, changes: data });

      const details = {
        message: `Se ha modificado la marca`,
        query: data,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'brands',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(brand);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getBrand, 'params'),
  checkAuth({ route: 'brands', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const brand = await service.delete({ id });
      const user = req.user;

      const details = {
        message: `Se ha ocultado la marca`,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'brands',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res
        .status(201)
        .json({ message: 'Se ha ocultado la marca', target: brand });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
