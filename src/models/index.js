const assetModel = require("./asset.model");
const assetSpecModel = require("./asset_spec.model");
const createdByModel = require("./created_by.model");
const locationModel = require("./location.model");
const maintenanceModel = require("./maintenances.model");
const modelModel = require("./model.model");

module.exports = {
  createdByModel,
  locationModel,
  modelModel,
  assetModel,
  maintenanceModel,
  assetSpecModel
}