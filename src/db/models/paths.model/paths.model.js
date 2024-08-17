const { Model, DataTypes, Sequelize } = require('sequelize');

const PATHS_RECORDS_TABLE = 'paths';

const PathRecordSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  path: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(30),
  },
  isAllow: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class PathRecord extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: PATHS_RECORDS_TABLE,
      modelName: 'PathRecord',
      timestamps: false,
    };
  }
}

module.exports = {
  PATHS_RECORDS_TABLE,
  PathRecordSchema,
  PathRecord,
};
