const { Model, DataTypes, Sequelize } = require('sequelize');

const PARANOID_TABLE = 'paranoid';

const { actions } = require('../../../utils/roles');

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

const ParanoidSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  executedSQL: {
    type: DataTypes.TEXT,
    field: 'executed_sql',
    allowNull: true,
  },
  reverseSQL: {
    type: DataTypes.TEXT,
    field: 'reverse_sql',
    allowNull: true,
  },
  logUser: {
    type: DataTypes.TEXT,
    field: 'log_user',
    allowNull: true,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Paranoid extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PARANOID_TABLE,
      modelName: 'Paranoid',
      timestamps: false,
    };
  }
}

module.exports = { PARANOID_TABLE, ParanoidSchema, Paranoid };
