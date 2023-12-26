const express = require('express');
const passport = require('passport');

const CategoriesServices = require('../../services/category.service');
const LogService = require('../../services/log.service');

const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const { upload } = require('../../middlewares/upload.handler');
const { parseCSV } = require('../../helpers/parseCSV.helper');

const specificationsRoute = require('./specification.route');
const classRoute = require('./class.route');

const {
  createCategory,
  getCategory,
  updateCategory,
  searchCategory,
} = require('../../schemas/category.schema');
const { ACTIONS, SCOPE } = require('../../utils/roles');

const service = new CategoriesServices();
const logService = new LogService();

const router = express.Router();

router.use('/specifications', specificationsRoute);
router.use('/classes', classRoute);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchCategory, 'query'),
  checkAuth({ route: 'categories', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const data = req.query;
      const categories = await service.find(data);

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createCategory, 'body'),
  checkAuth({ route: 'categories', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const data = req.body;
      const user = req.user;

      const newCategory = await service.create({ data, user });
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'categories',
        targetId: newCategory.dataValues.id,
        details: `Se ha creado la categoría ${newCategory.dataValues.name}`,
        ip: req.ip,
        createdById: user.sub,
      });
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/import',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: SCOPE.CATEGORIES, crud: ACTIONS.IMPORT }),
  upload.single('categories'),
  async (req, res, next) => {
    try {
      const filePath = req.file.path;
      const csvData = await parseCSV(filePath, ',', req.user.sub);

      const imported = await service.createMany(csvData);
      const total = imported.filter((item) => item.isNewRecord);
      res.status(201).json({
        message: 'Se han importado ' + total.length + ' categorías',
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
  validatorHandler(getCategory, 'params'),
  checkAuth({ route: 'categories', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await service.findOne(id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getCategory, 'params'),
  validatorHandler(updateCategory, 'body'),
  checkAuth({ route: 'categories', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const data = req.body;

      const details = {
        message: `Se ha creado modificado la categoría`,
        query: data,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'categories',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      const category = await service.update({ id, data });
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getCategory, 'params'),
  checkAuth({ route: 'categories', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const category = await service.delete(id);

      const details = {
        message: `Se ha creado ocultado la categoría`,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: 'categories',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(202).json({
        message: 'category deleted ' + category.dataValues.name,
        target: category,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
