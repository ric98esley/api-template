const { Model, DataTypes } = require('sequelize');

const { USER_TABLE } = require('../user.model');
const { ASSET_TABLE } = require('.');
const { HARDWARE_SPEC_TABLE } = require('./specification.model');

const ASSET_SPEC_TABLE = 'asset_specifications';
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

const AssetSpecSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  value: {
    allowNull: false,
    type: DataTypes.STRING(45),
  },
  typeId: {
    allowNull: false,
    field: 'type_id',
    type: DataTypes.INTEGER,
    references: {
      model: HARDWARE_SPEC_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
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
  updatedById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'updated_by_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  deletedById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'deleted_by_id',
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

class AssetSpec extends Model {
  static associate(models) {
    this.belongsTo(models.Hardware, {
      as: 'type',
      foreignKey: 'typeId'
    });
    this.belongsTo(models.Asset, {
      as: 'asset',
      foreignKey: 'assetId'
    })
  }

  // Hook que se ejecutará antes de guardar o actualizar un registro

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSET_SPEC_TABLE,
      modelName: 'AssetSpec',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { ASSET_SPEC_TABLE, AssetSpecSchema, AssetSpec };
