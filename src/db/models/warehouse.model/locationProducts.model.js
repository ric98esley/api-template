const { Model, DataTypes, Sequelize } = require('sequelize');

const LOCATION_PRODUCTS_TABLE = 'location_has_products';
const { USER_TABLE } = require('../user.model');
const { LOCATION_TABLE } = require('../location.model');
const { PRODUCT_TABLE } = require('../consumable.model');

/**
 * @description description of each field in the table
 * @typedef {Object} field definition
 * @property {boolean} allowNull - false=NOT NULL
 * @property {boolean} autoIncrement - each insert, increase the counter
 * @property {boolean} primaryKey - define is primary key
 * @property {boolean} type - expresion to match SQL type
 * @property {boolean} unique - difne as unique the field
 * @property {boolean} field - rename the field
 */

const LocationProductsSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  productId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'product_id',
    references: {
      model: PRODUCT_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  locationId: {
    allowNull: false,
    field: 'location_id',
    type: DataTypes.INTEGER,
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  quantity: {
    allowNull: false,
    type: DataTypes.DECIMAL(9,2),
    allowNull: false,
    defaultValue: 0
  },
  min: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
};

class LocationProducts extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById'
    })
    this.belongsTo(models.Location,{
      as: 'location',
      foreignKey: 'locationId'
    })
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: LOCATION_PRODUCTS_TABLE,
      modelName: 'LocationProducts',
      timestamps: false,
    };
  }
}

module.exports = { LOCATION_PRODUCTS_TABLE, LocationProductsSchema, LocationProducts };