const { Model, DataTypes } = require('sequelize');

const V_MOVEMENT_TABLE = 'v_movements';

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

const VMovementSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    field: 'order_id'
  },
  serial: {
    type: DataTypes.STRING,
  },
  model: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  brand: {
    type: DataTypes.STRING,
  },
  fromId: {
    type: DataTypes.STRING,
    field: 'from_id',
  },
  fromCode: {
    type: DataTypes.STRING,
    field: 'from_code',
  },
  fromName: {
    type: DataTypes.STRING,
    field: 'from_name',
  },
  toId: {
    type: DataTypes.STRING,
    field: 'to_id',
  },
  toCode: {
    type: DataTypes.STRING,
    field: 'to_code',
  },
  toName: {
    type: DataTypes.STRING,
    field: 'to_name',
  },
  toGroupCode: {
    type: DataTypes.STRING,
    field: 'group_code',
  },
  toGroupName: {
    type: DataTypes.STRING,
    field: 'group_name',
  },
  type: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  current: {
    type: DataTypes.BOOLEAN,
  },
  createdBy: {
    type: DataTypes.STRING,
    field: 'created_by',
  },
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
  },
};

class VMovement extends Model {
  static associate(models) {
    this.belongsTo(models.OrderRecord, {
      as: 'order',
      foreignKey: 'orderId',
    });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: V_MOVEMENT_TABLE,
      modelName: 'VMovement',
      timestamps: false,
      paranoid: false,
    };
  }
}

module.exports = {
  V_MOVEMENT_TABLE,
  VMovementSchema,
  VMovement,
};
