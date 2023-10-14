const { Model, DataTypes, Sequelize } = require('sequelize');

const ATTEMPT_TABLE = 'attempt';

/**
 * @description description of each field in the table
 * @typedef {Object} field definition
 * @property {boolean} allowNull - false=NOT NULL
 * @property {boolean} autoIncrement - each insert, increase the counter
 * @property {boolean} primaryKey - define is primary key
 * @property {DataTypes} type - expresion to match SQL type
 * @property {boolean} unique - difne as unique the field
 * @property {string} field - rename the field
 */

const AttemptSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  username: {
    allowNull: false,
    type: DataTypes.STRING,
    set(value) {
      this.setDataValue('username', value.trim().toLowerCase());
    },
  },
  ip: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class Attempt extends Model {
  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ATTEMPT_TABLE,
      modelName: 'Attempt',
      timestamps: false,
    };
  }
}

module.exports = { ATTEMPT_TABLE, AttemptSchema, Attempt };
