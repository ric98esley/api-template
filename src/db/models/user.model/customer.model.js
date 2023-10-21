const { Model, DataTypes } = require('sequelize');
const { USER_TABLE } = require('.');

const CUSTOMER_TABLE = 'customers';

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


const CustomerSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
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
  cardId: {
    allowNull: true,
    type: DataTypes.STRING(25),
    field: 'card_id',
    set(value) {
      this.setDataValue('cardId', value.trim().toUpperCase());
    },
  },
  userId: {
    unique: true,
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: true,
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  createdById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
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

class Customer extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userID'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CUSTOMER_TABLE,
      modelName: 'Customer',
      timestamps: true,
    };
  }
}

module.exports = { CUSTOMER_TABLE, CustomerSchema, Customer };
