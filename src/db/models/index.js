const bcryptjs = require('bcryptjs');


const { User, UserSchema } = require("./user.model");
const { Customer, CustomerSchema } = require("./user.model/customer.model");
const { Log, LogSchema } = require('./log.model');
const { Group, GroupSchema } = require('./group.model');
const { Category, CategorySchema } = require('./category.model');
const { Brand, BrandSchema } = require('./brand.model');
const { AssetModel, ModelSchema } = require('./asset.model/model.model');
const { Asset, AssetSchema } = require('./asset.model');
const { HardwareSpec, HardwareSpecSchema } = require('./asset.model/specification.model');
const { CategorySpec, CategorySpecSchema } = require('./category.model/categorySpec.model');
const { AssetSpec, AssetSpecSchema } = require('./asset.model/assetSpec.model');
const { OrderRecord, OrderRecordSchema } = require('./orders.model');
const { Movement, MovementSchema } = require('./orders.model/movement.model');
const { Location, LocationSchema } = require('./location.model');
const { Zone, ZoneSchema } = require('./location.model/zone.model');
const { LocationType, LocationTypeSchema } = require('./location.model/type.model');
const { VAsset, VAssetSchema } = require('./asset.model/v_asset.model');

function setupModels(sequelize) {

  // INICIALIZA MODELOS
  Customer.init(CustomerSchema, Customer.config(sequelize));
  User.init(UserSchema, User.config(sequelize));
  Log.init(LogSchema, Log.config(sequelize));
  Group.init(GroupSchema, Group.config(sequelize));
  Category.init(CategorySchema, Category.config(sequelize));
  Brand.init(BrandSchema, Brand.config(sequelize));
  AssetModel.init(ModelSchema, AssetModel.config(sequelize));
  Asset.init(AssetSchema, Asset.config(sequelize));
  HardwareSpec.init(HardwareSpecSchema, HardwareSpec.config(sequelize));
  CategorySpec.init(CategorySpecSchema, CategorySpec.config(sequelize));
  AssetSpec.init(AssetSpecSchema, AssetSpec.config(sequelize));

  Zone.init(ZoneSchema, Zone.config(sequelize));
  LocationType.init(LocationTypeSchema, LocationType.config(sequelize));
  Location.init(LocationSchema, Location.config(sequelize));

  OrderRecord.init(OrderRecordSchema, OrderRecord.config(sequelize));
  Movement.init(MovementSchema, Movement.config(sequelize));

  VAsset.init(VAssetSchema, VAsset.config(sequelize))

  // INICIALIZA ASOCIACIONES

  Customer.associate(sequelize.models);
  User.associate(sequelize.models);
  Log.associate(sequelize.models);
  Group.associate(sequelize.models);
  Category.associate(sequelize.models);
  Brand.associate(sequelize.models);
  AssetModel.associate(sequelize.models);
  Asset.associate(sequelize.models);
  CategorySpec.associate(sequelize.models);
  AssetSpec.associate(sequelize.models);
  HardwareSpec.associate(sequelize.models);

  Zone.associate(sequelize.models);
  LocationType.associate(sequelize.models);
  Location.associate(sequelize.models);

  OrderRecord.associate(sequelize.models);
  Movement.associate(sequelize.models);

  // HOOKS

  User.addHook('beforeUpdate', async (options) => {
    try {
      if (options && options.dataValues) {
        if (options.dataValues.password) {
          const hash = await bcryptjs.hash(
            options.dataValues.password,
            10
          );
          options.dataValues.password = hash
        }
      }
    } catch (error) {}
  });

  User.addHook('beforeCreate', async (options) => {
    try {
      if (options && options.dataValues) {
        if (options.dataValues.password) {
          const hash = await bcryptjs.hash(
            options.dataValues.password,
            10
          );
          options.dataValues.password = hash
        }
      }
    } catch (error) {}
  });
}

module.exports = setupModels