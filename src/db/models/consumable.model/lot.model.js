const { Model, DataTypes } = require('sequelize');
const { USER_TABLE } = require('../user.model');
const { LOCATION_TABLE } = require('../location.model');

const LOT_TABLE = 'lot';

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

const LotSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  customer: {
    allowNull: false,
    type: DataTypes.STRING(55)
  },
  type: {
    allowNull: false,
    field: 'type',
    type: DataTypes.STRING(8),
    validate: {
      isIn: [['checking', 'checkout']],
    },
  },
  locationId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'location_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id'
    },
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
  description: {
    type: DataTypes.TEXT,
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
}

class Lot extends Model {
  static associate(models) {
    this.hasMany(models.ProductHistory, {
      as: 'movements',
      foreignKey: 'lotId',
    });
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById'
    });
    this.belongsTo(models.Location, {
      as: 'location',
      foreignKey: 'locationId'
    })
  }
  
  static config(sequelize) {
    return {
      sequelize,
      tableName: LOT_TABLE,
      modelName: 'Lot',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { LotSchema, Lot, LOT_TABLE}