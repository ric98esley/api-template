const { Model, DataTypes } = require('sequelize');
const { ROLES } = require('../../../utils/roles');

const USER_TABLE = 'users';

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

const roles = Object.values(ROLES);

const UserSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  username: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
    set(value) {
      this.setDataValue('username', value.trim().toLowerCase());
    },
  },
  email: {
    allowNull: true,
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: {
        msg: 'must be a email',
      },
    },
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING(60),
  },
  role: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      isIn: [roles],
    },
    defaultValue: 'customer',
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recoveryToken: {
    field: 'recovery_token',
    allowNull: true,
    type: DataTypes.STRING,
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    field: 'active',
    defaultValue: false,
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

class User extends Model {
  static associate(models) {
    this.hasOne(models.Customer, {
      as: 'profile',
      foreignKey: 'userId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_TABLE,
      modelName: 'User',
      timestamps: true,
    };
  }
}

module.exports = { USER_TABLE, UserSchema, User };
