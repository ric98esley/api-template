const { Model, DataTypes, Sequelize } = require('sequelize');

const COSTUMER_TABLE = 'costumers';

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


const CostumerSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
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
  name: {
    allowNull: false,
    type: DataTypes.STRING(55),
    field: 'name',
    set(value) {
      this.setDataValue('name', value.trim());
    },
  },
  lastName: {
    allowNull: true,
    type: DataTypes.STRING(55),
    field: 'last_name',
    set(value) {
      this.setDataValue('lastName', value.trim());
    },
  },
  phone: {
    allowNull: false,
    type: DataTypes.STRING(15),
    field: 'phone',
    set(value) {
      this.setDataValue('phone', value.trim().toUpperCase());
    },
  },
  storeId: {
    field: 'store_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
  },
  cardId: {
    allowNull: false,
    type: DataTypes.STRING(25),
    field: 'card_id',
    set(value) {
      this.setDataValue('cardId', value.trim().toUpperCase());
    },
  },
  address: {
    allowNull: true,
    type: DataTypes.TEXT,
    field: 'address',
    set(value) {
      this.setDataValue('address', value.trim());
    },
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

class Costumer extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.hasOne(models.Auth, {
      as: 'profile',
      foreignKey: 'userId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COSTUMER_TABLE,
      modelName: 'Costumer',
      timestamps: true,
    };
  }
}

module.exports = { COSTUMER_TABLE, CostumerSchema, Costumer };
