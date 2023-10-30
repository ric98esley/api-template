const { Model, DataTypes, Sequelize } = require('sequelize');

const MOVEMENT_TABLE = 'movement_consumable';
const { USER_TABLE } = require('../user.model');
const { LOCATION_TABLE } = require('../location.model');

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

const MovementSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  fromId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'from_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  toId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'to_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('add', 'sub'),
    allowNull: false
  },
  quantity: {
    allowNull: false,
    type: DataTypes.DECIMAL(9,2),
    allowNull: false,
    defaultValue: 0
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'created_by_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  inTransit: {
    allowNull: false,
    field: 'in_transit',
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

class Movement extends Model {
  static associate(models) {
    this.belongsToMany(models.Product, {
      through: models.WarehouseProducts,
      as: 'product',
      foreignKey: 'productId'
    })
    this.belongsToMany(models.Deposit, {
      through: models.WarehouseProducts,
      as: 'deposit',
      foreignKey: 'depositId'
    })
    this.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    })
    this.belongsTo(models.WarehouseProducts,
      {
        as: 'warehouse',
        foreignKey: 'warehouseProductId'
      })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MOVEMENT_TABLE,
      modelName: 'Movement',
      timestamps: false,
    };
  }
}

module.exports = { MOVEMENT_TABLE, MovementSchema, Movement };
