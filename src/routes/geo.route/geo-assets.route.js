const express = require('express');
const passport = require('passport');

const validatorHandler = require('../../middlewares/validator.handler');
const {
  createGeoAssetSchema,
} = require('../../schemas/geo.schema/geo-asset.schema');
const { GeoAssetServices } = require('../../services/geo.service');

const geoService = new GeoAssetServices();

const router = express.Router();

router.post(
  '/',
  validatorHandler(createGeoAssetSchema, 'body'),
  async (req, res, next) => {
    try {
      console.log(req.headers);

      const data = req.body;
      const geo = await geoService.create({ ip: req.ip, ...data });

      res.status(202).json(geo);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
