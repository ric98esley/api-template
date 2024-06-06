const { Model, DataTypes } = require('sequelize');

const GEO_ASSET_TABLE = 'geo_asset_alerts';

const GeoAssetSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  ip: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  serial: {
    allowNull: true,
    type: DataTypes.STRING(45),
    set(value) {
      this.setDataValue('serial', String(value).trim().toUpperCase());
    },
  },
  alert: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  alertType: {
    field: 'alert_type',
    type: DataTypes.STRING(45),
    allowNull: true,
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

class GeoAsset extends Model {
  static associate(models) {
    this.belongsTo(models.Asset, {
      as: 'asset',
      foreignKey: 'serial',
      targetKey: 'serial',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: GEO_ASSET_TABLE,
      modelName: 'GeoAsset',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { GEO_ASSET_TABLE, GeoAssetSchema, GeoAsset };
