const { Model, DataTypes } = require('sequelize');

const V_ASSET_TABLE = 'v_assets';
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

const VAssetSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  serial: {
    allowNull: false,
    type: DataTypes.STRING(45),
  },
  model: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  category: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  brand: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  locationId: {
    field: 'location_id',
    allowNull: false,
    type: DataTypes.STRING,
  },
  locationCode: {
    field: 'location_code',
    allowNull: false,
    type: DataTypes.STRING,
  },
  location: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  groupId: {
    allowNull: true,
    field: 'group_id',
    type: DataTypes.INTEGER,
  },
  groupCode: {
    allowNull: true,
    field: 'group_code',
    type: DataTypes.INTEGER,
  },
  group: {
    field: 'group_name',
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  createdBy: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
  },
};

class VAsset extends Model {
  static associate(models) {
  }

  // Hook que se ejecutará antes de guardar o actualizar un registro

  static config(sequelize) {

    return {
      sequelize,
      tableName: V_ASSET_TABLE,
      modelName: 'VAsset',
      timestamps: false,
      paranoid: false,
    };
  }
}

module.exports = { V_ASSET_TABLE, VAssetSchema, VAsset };
