const express = require('express');
const passport = require('passport');

const BrandsServices = require('../../services/brand.service');
const validatorHandler = require('../../middlewares/validator.handler');
const { createBrand, searchBrand, getBrand } = require('../../schemas/brand.schema');

const service = new BrandsServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchBrand, 'query'),
  async (req, res, next) => {
    try {

      const queries = req.query;
      const brands = await service.find(queries);

      res.status(200).json(brands)
    } catch (error) {
      next(error)
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),

  validatorHandler(createBrand, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.createdById = req.user.sub;

      const brand = await service.create(body);

      res.status(201).json(brand);
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getBrand, 'params'),
  validatorHandler(createBrand, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const body = req.body;

      const brand = await service.update({id, changes: body});

      res.status(201).json(brand);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),

  validatorHandler(getBrand, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const brand = await service.delete({ id });

      res.status(201).json(brand);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router
