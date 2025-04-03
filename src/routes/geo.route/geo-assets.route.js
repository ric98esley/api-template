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
const AssetsServices = require('../../services/asset.service');
const geoService = new GeoAssetServices();
const assetService = new AssetsServices();

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(findGeoAssetSchema, 'query'),
  checkUser(),
  checkAuth({ route: SCOPE.GEO, crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      const geo = await geoService.find(query);

      res.status(200).json(geo);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  validatorHandler(createGeoAssetSchema, 'body'),
  async (req, res, next) => {
    try {
      const data = req.body;

      const asset = await assetService.findBySerial({ serial: data.serial });
      await geoService.create({ ...data, ip: req.ip, locationId: asset?.location?.id });

      res.status(202);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
