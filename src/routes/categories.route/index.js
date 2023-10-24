const express = require('express');
const passport = require('passport');

const CategoriesServices = require('../../services/category.service');
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

const specificationsRoute = require('./specification.route')

const {
  createCategory,
  getCategory,
  updateCategory,
  searchCategory,
} = require('../../schemas/category.schema');

const service = new CategoriesServices();

const router = express.Router();

router.use('/specifications', specificationsRoute)

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchCategory, 'query'),
  checkAuth({ route: 'categories', crud: 'read' }),
  async (req, res, next) => {
    try {
      const data = req.query
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
  checkAuth({ route: 'categories', crud: 'create' }),
  async (req, res, next) => {
    try {
      const data = req.body;
      const user = req.user;

      const newCategory = await service.create({ data, user });
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCategory, 'params'),
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
  validatorHandler(getCategory, 'params'),
  validatorHandler(updateCategory, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

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
  validatorHandler(getCategory, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(202).json({
        msg: 'category deleted ' + id,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
