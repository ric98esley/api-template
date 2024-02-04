const express = require('express');
const passport = require('passport');

// Middlewares
const { checkUser, checkAuth } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

// Schemas

const { findProduct, createProduct, updateProduct, getProduct } = require('../../schemas/consumable.schema/product.schema');

const router = express.Router();

// service
const ProductService = require('../../services/consumable.service/product.service');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const productService = new ProductService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(findProduct, 'query'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      const products = await productService.find(query);

      res.status(201).json(products);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getProduct, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await productService.findOne({
        id
      });

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createProduct, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.createdById = req.user.sub;
      const newProduct = await productService.create(body);

      res.status(200).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getProduct, 'params'),
  validatorHandler(updateProduct, 'body'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const changes = req.body;
      const productUpdated = await productService.update({ changes, id });

      res.status(201).json(productUpdated);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getProduct, 'params'),
  checkAuth({ route: SCOPE.CONSUMABLES, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const productDeleted = await productService.delete({ id });

      res.status(201).json(productDeleted);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
