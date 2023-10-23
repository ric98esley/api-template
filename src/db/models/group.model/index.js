const { Model, DataTypes, Sequelize } = require('sequelize');

const GROUP_TABLE = 'groups';

const { USER_TABLE } = require('../user.model');
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

const GroupSchema = {
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING(45),
    set(value) {
      this.setDataValue('code', value.trim().toUpperCase());
    }
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(45),
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  enabled: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  managerId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'manager_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
  },
  parentId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'parent_id',
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Group extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'manager',
      foreignKey: 'managerId',
    });
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
    this.belongsTo(models.Group, {
      as: 'parent',
      foreignKey: 'parentId',
    });
    this.hasMany(models.Group, {
      as: 'children',
      foreignKey: 'parentId'
    })
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: GROUP_TABLE,
      modelName: 'Group',
      timestamps: false,
    };
  }
}

module.exports = { GROUP_TABLE, GroupSchema, Group };
