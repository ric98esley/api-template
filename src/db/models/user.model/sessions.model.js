const { Model, DataTypes, Sequelize } = require('sequelize');
const { USER_TABLE } = require('.');

const SESSION_TABLE = 'sessions';

const SessionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  token: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  },
  ip: {
    allowNull: true,
    type: DataTypes.STRING(45),
  },
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: USER_TABLE,
      key: 'id',
      onDelete: 'CASCADE',
    },
  },
  createdAt: {
    allowNull: false,
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
};

class Session extends Model {
  static associate(models) {
    Session.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SESSION_TABLE,
      modelName: 'Session',
      timestamps: false,
    };
  }
}

module.exports = {
  Session,
  SessionSchema,
  SESSION_TABLE,
};
