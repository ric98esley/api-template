const { Model, DataTypes } = require('sequelize');

const { USER_TABLE } = require('../user.model');
const { MODEL_TABLE } = require('./model.model');
const { LOCATION_TABLE } = require('../location.model');

const ASSET_TABLE = 'assets';
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

const AssetSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  serial: {
    allowNull: false,
    type: DataTypes.STRING(45),
    unique: true,
    set(value) {
      this.setDataValue('serial', value.trim().toUpperCase());
    },
  },
  modelId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'model_id',
    references: {
      model: MODEL_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  locationId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'location_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  notes: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  countChecking: {
    allowNull: false,
    field: 'count_checking',
    type: DataTypes.INTEGER,
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
  enabled: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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

class Asset extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.belongsTo(models.Location, {
      as: 'location',
      foreignKey: 'locationId',
    });
    this.belongsTo(models.Model, { as: 'model', foreignKey: 'modelId' });
    this.hasMany(models.AssetSpec, {
      as: 'specifications',
      foreignKey: 'assetId',
    });
    this.hasMany(models.Movement, {
      as: 'movements',
      foreignKey: 'assetId'
    })
  }

  // Hook que se ejecutará antes de guardar o actualizar un registro

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSET_TABLE,
      modelName: 'Asset',
      timestamps: true, 
      paranoid: true,
    };
  }
}

module.exports = { ASSET_TABLE, AssetSchema, Asset };
