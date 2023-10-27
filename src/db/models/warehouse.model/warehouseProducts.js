const { Model, DataTypes, Sequelize } = require('sequelize');

const WAREHOUSE_PRODUCTS_TABLE = 'warehouse_has_products';
const { WAREHOUSE_TABLE } = require('.');
const { USER_TABLE } = require('../user.model');
const { ASSET_TABLE } = require('../asset.model');

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

const WarehouseProductsSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  assetId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'product_id',
    references: {
      model: ASSET_TABLE,
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
  warehouseId: {
    allowNull: false,
    field: 'warehouse_id',
    type: DataTypes.INTEGER,
    references: {
      model: WAREHOUSE_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
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
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
  },
  deletedAt: {
    field: 'deleted_at',
    type: DataTypes.DATE,
  },
};

class WarehouseProducts extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById'
    })
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: WAREHOUSE_PRODUCTS_TABLE,
      modelName: 'WarehouseProducts',
      timestamps: true, 
paranoid: true
    };
  }
}

module.exports = { WAREHOUSE_PRODUCTS_TABLE, WarehouseProductsSchema, WarehouseProducts };