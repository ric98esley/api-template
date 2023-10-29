const { Model, DataTypes } = require('sequelize');

const MOVEMENT_TABLE = 'movements';

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
  type: {
    allowNull: false,
    type: DataTypes.STRING(12),
    defaultValue: 'asset'
  },
  assetId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'target_id',
  },
  fromId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'from_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  toId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'to_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  quantity: {
    allowNull: false,
    type: DataTypes.DECIMAL(9, 2),
    allowNull: false,
    defaultValue: 1,
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
      as: 'from',
      foreignKey: 'fromId',
    });
    this.belongsTo(models.Location, {
      as: 'to',
      foreignKey: 'toId',
    });
    this.belongsTo(models.OrderRecord, {
      as: 'order',
      foreignKey: 'orderId',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: MOVEMENT_TABLE,
      modelName: 'Movement',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = {
  MOVEMENT_TABLE,
  MovementSchema,
  Movement,
};
