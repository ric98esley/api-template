const assetModel = require("./asset.model");
const assetSpecModel = require("./asset_spec.model");
const brandModel = require("./brand.model");
const categoryModel = require("./category.model");
const createdByModel = require("./created_by.model");
const groupModel = require("./group.model");
const locationModel = require("./location.model");
const locationTypeModel = require("./location_type.model");
const maintenanceModel = require("./maintenances.model");
const modelModel = require("./model.model");
const userModel = require("./user.model");
const zoneModel = require("./zone.model");

module.exports = {
  createdByModel,
  locationModel,
  modelModel,
  assetModel,
  maintenanceModel,
  assetSpecModel,
  brandModel,
  categoryModel,
  groupModel,
  zoneModel,
  locationTypeModel,
  userModel
}