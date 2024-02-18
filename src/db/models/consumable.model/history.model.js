const { Model, DataTypes, Sequelize } = require('sequelize');

const PRODUCT_HISTORY = 'product_history';
const { LOT_TABLE } = require('./lot.model');
const {
  LOCATION_PRODUCTS_TABLE,
} = require('../warehouse.model/locationProducts.model');

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

const ProductHistorySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  lotId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'lot_id',
    references: {
      model: LOT_TABLE,
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  targetId: {
    type: DataTypes.INTEGER,
    field: 'target_id',
    references: {
      model: LOCATION_PRODUCTS_TABLE,
      key: 'id',
    },
  },
  quantity: {
    allowNull: false,
    type: DataTypes.DECIMAL(9, 2),
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class ProductHistory extends Model {
  static associate(models) {
    this.belongsTo(models.LocationProducts, {
      as: 'target',
      foreignKey: 'targetId'
    })
    this.belongsTo(models.Lot,
      {
        as: 'lot',
        foreignKey: 'lotId'
      }
      )
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PRODUCT_HISTORY,
      modelName: 'ProductHistory',
      timestamps: false,
    };
  }
}

module.exports = { PRODUCT_HISTORY, ProductHistorySchema, ProductHistory };
