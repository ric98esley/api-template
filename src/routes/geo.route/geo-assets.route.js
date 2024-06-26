const express = require('express');
const passport = require('passport');

const { checkAuth, checkUser } = require('../../middlewares/auth.handler');
const { ACTIONS, SCOPE } = require('../../utils/roles');

// validators
const validatorHandler = require('../../middlewares/validator.handler');
const {
  createGeoAssetSchema,
  findGeoAssetSchema,
} = require('../../schemas/geo.schema/geo-asset.schema');

const { GeoAssetServices } = require('../../services/geo.service');
const geoService = new GeoAssetServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(findGeoAssetSchema),
  checkUser(),
  checkAuth({ route: SCOPE.GEO, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.body;
      const geo = await geoService.find(query);

      res.status(200).json(geo)
    } catch (error) {
      next(error)
    }
  }
);

router.post(
  '/',
  validatorHandler(createGeoAssetSchema, 'body'),
  async (req, res, next) => {
    try {
      console.log(req.headers);

      const data = req.body;
      const geo = await geoService.create({ ...data, ip: req.ip });

      res.status(202).json(geo);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
