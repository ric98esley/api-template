const { Model, Sequelize, DataTypes } = require('sequelize');

const { ROLE_TABLE } = require('./role.model');

const ABILITY_TABLE = 'abilities';

const AbilitySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  roleId: {
    allowNull: false,
    type: Sequelize.INTEGER,
    field: 'role_id',
    references: {
      model: ROLE_TABLE,
      key: 'id',
    },
  },
  resource: {
    allowNull: false,
    type: Sequelize.STRING(55),
    field: 'resource',
    set(value) {
      this.setDataValue('resource', value.trim());
    },
  },
  action: {
    allowNull: false,
    type: Sequelize.STRING(55),
    field: 'action',
    set(value) {
      this.setDataValue('action', value.trim());
    },
  },
  scope: {
    allowNull: false,
    type: Sequelize.STRING(55),
    field: 'scope',
    set(value) {
      this.setDataValue('scope', value.trim());
    },
  },
  attributes: {
    allowNull: false,
    type: Sequelize.TEXT,
    field: 'attributes',
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

class AbilityModel extends Model {
  static associate(models) {
    this.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: ABILITY_TABLE,
      modelName: 'Ability',
      timestamps: true,
      underscored: true,
    };
  }
}

module.exports = {
  AbilityModel,
  AbilitySchema,
  ABILITY_TABLE,
};