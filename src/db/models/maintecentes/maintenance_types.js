const { Model, DataTypes } = require('sequelize');

const { USER_TABLE } = require('../user.model');

const MAINTENANCES_TYPE_TABLE = 'maintenance_types';

const MaintenanceTypeSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(45),
    unique: true,
  },
  description: {
    allowNull: true,
    type: DataTypes.TEXT,
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
};

class MaintenanceType extends Model {
  static associate(models) {
    MaintenanceType.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MAINTENANCES_TYPE_TABLE,
      modelName: 'MaintenanceType',
      timestamps: false,
    };
  }
}

module.exports = {
  MAINTENANCES_TYPE_TABLE,
  MaintenanceTypeSchema,
  MaintenanceType,
};
