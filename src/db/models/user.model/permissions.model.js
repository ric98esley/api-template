const { Model, DataTypes, Sequelize } = require('sequelize');

const { scopes, actions, possessions } = require('../../../utils/roles');
const { ROLE_TABLE } = require('./role.model');

const PERMISSIONS_TABLE = 'permissions';

const PermissionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  role: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.STRING(15),
    references: {
      model: ROLE_TABLE,
      key: 'name',
      onDelete: 'CASCADE',
    },
  },
  scope: {
    allowNull: false,
    type: DataTypes.STRING(15),
    validator: {
      isIn: [scopes],
    },
    set(value) {
      this.setDataValue('scope', String(value).trim().toLowerCase());
    }
  },
  capability: {
    allowNull: false,
    type: DataTypes.STRING(15),
    validator: {
      isIn: [actions],
    },
    set(value) {
      this.setDataValue('capability', String(value).trim().toLowerCase());
    }
  },
  possession: {
    allowNull: false,
    type: DataTypes.STRING(15),
    validator: {
      isIn: [possessions],
    },
    set(value) {
      this.setDataValue('possession', String(value).trim().toLowerCase());
    }
  },
  createdAt: {
    allowNull: false,
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
};

class Permission extends Model {
  static associate(models) {
    // this.belongsTo(models.Role, {
    //   foreignKey: 'role',
    //   targetKey: 'name',
    //   as: 'parent',
    // });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: PERMISSIONS_TABLE,
      modelName: 'Permission',
      timestamps: false,
    };
  }
}

module.exports = { PERMISSIONS_TABLE, PermissionSchema, Permission };
