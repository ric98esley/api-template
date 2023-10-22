const { Model, DataTypes, Sequelize } = require('sequelize');

const LOG_TABLE = 'log';

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

const LogSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  type: {
    field: 'type',
    type: DataTypes.STRING(12),
    allowNull: false,
  },
  table: {
    allowNull: true,
    type: DataTypes.STRING
  },
  targetId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'target_id',
  },
  details: {
    allowNull: true,
    type: DataTypes.TEXT
  },
  ip: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
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

class Log extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: LOG_TABLE,
      modelName: 'Log',
      timestamps: false,
    };
  }
}

module.exports = { LOG_TABLE, LogSchema, Log };
