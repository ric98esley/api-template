const { Model, DataTypes } = require('sequelize');

const { USER_TABLE } = require('../user.model');
const { ASSET_TABLE } = require('../asset.model');
const { MAINTENANCES_TYPE_TABLE } = require('./maintenance_types');
const { create } = require('mathjs');

const MAINTENANCES_TABLE = 'maintenances';
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

const MaintenanceSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  assetId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'asset_id',
    references: {
      model: ASSET_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  maintenanceTypeId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'maintenance_type_id',
    references: {
      model: MAINTENANCES_TYPE_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  description: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  cost: {
    allowNull: true,
    type: DataTypes.DECIMAL(10, 2),
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
  createAt: {
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
}

class Maintenance extends Model {
  static associate(models) {
    Maintenance.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
    Maintenance.belongsTo(models.Asset, {
      as: 'asset',
      foreignKey: 'assetId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MAINTENANCES_TABLE,
      modelName: 'Maintenance',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = {
  MAINTENANCES_TABLE,
  MaintenanceSchema,
  Maintenance,
};