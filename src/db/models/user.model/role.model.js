const { Model, DataTypes, Sequelize } = require('sequelize');


const ROLE_TABLE = 'roles';

const RoleSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING(15),
    set(value) {
      this.setDataValue('name', String(value).trim().toLowerCase());
    }
  },
  description: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  createdAt: {
    allowNull: false,
    field: 'created_at',
    type: DataTypes.DATE,
    default: Sequelize.NOW,
  },
}

class Role extends Model {
  static associate(models) {
    Role.belongsTo(models.User, {
      foreignKey: 'role',
      as: 'users',
    });
    Role.hasMany(models.Permission, {
      foreignKey: 'name',
      as: 'permissions',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ROLE_TABLE,
      modelName: 'Role',
      timestamps: false,
    }
  }
}

module.exports = { ROLE_TABLE, RoleSchema, Role };

