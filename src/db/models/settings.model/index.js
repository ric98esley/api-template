const { Model, DataTypes, Sequelize } = require('sequelize');

const SETTINGS_TABLE = 'settings';

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

const SettingSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  business: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  qrType: {
    field: 'qr_type',
    type: DataTypes.STRING,
  },
  barcodeType: {
    field: 'barcode_type',
    type: DataTypes.STRING,
  },
  zeroFill: {
    field: 'zero_fill',
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  prefix: {
    type: DataTypes.STRING,
  },
  next: {
    type: DataTypes.INTEGER,
    field: 'next_tag',
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

class Settings extends Model {
  static associate(models) {}

  static config(sequelize) {
    return {
      sequelize,
      tableName: SETTINGS_TABLE,
      modelName: 'Settings',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = {
  SettingSchema,
  SETTINGS_TABLE,
  Settings,
};
