const { DataTypes, Sequelize, Model } = require('sequelize');
const { USER_TABLE } = require('../user.model');

const LOCATION_TYPE_TABLE = 'location_types';

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

const LocationTypeSchema = {
  id: {
    allowNull: false,
    unique: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  name: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING(45),
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
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

class LocationType extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: LOCATION_TYPE_TABLE,
      modelName: 'LocationType',
      timestamps: true, 
paranoid: true
    };
  }
}

module.exports = { LocationTypeSchema, LOCATION_TYPE_TABLE, LocationType };
