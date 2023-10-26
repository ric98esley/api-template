const { Model, DataTypes } = require('sequelize');

const MOVEMENT_TABLE = 'movements';

const { ASSET_TABLE } = require('../asset.model');
const { USER_TABLE } = require('../user.model');
const { LOCATION_TABLE } = require('../location.model');
const { ORDERS_RECORDS_TABLE } = require('.');

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

const MovementSchema = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  },
  assetId: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.INTEGER,
    field: 'target_id',
    references: {
      model: ASSET_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  from: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'from',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  to: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'to',
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
    defaultValue: 1
  },
  current: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    field: 'current',
    defaultValue: true,
  },
  orderId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ORDERS_RECORDS_TABLE,
      key: 'id',
    },
    field: 'order_id',
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

class Movement extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
    this.belongsTo(models.Asset, {
      as: 'asset',
      foreignKey: 'assetId',
    });

    this.belongsTo(models.Location, {
      as: 'location',
      foreignKey: 'locationId',
    });
    this.belongsTo(models.OrderRecord, {
      as: 'orders',
      foreignKey: '',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: MOVEMENT_TABLE,
      modelName: 'Movement',
      timestamps: true, 
paranoid: true
    };
  }
}

module.exports = {
  MOVEMENT_TABLE,
  MovementSchema,
  Movement,
};
