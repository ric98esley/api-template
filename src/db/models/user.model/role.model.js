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
  ability: {
    allowNull: true,
    type: DataTypes.JSON,
  },
  createdAt: {
    allowNull: false,
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}

class Role extends Model {
  static associate(models) {
    Role.hasMany(models.User, {
      as: 'users',
      foreignKey: 'role',
      sourceKey: 'name',
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

