const { Model, DataTypes, Sequelize } = require('sequelize');

const ORDERS_RECORDS_TABLE = 'orders';
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

const actionType = [
  'checkout',
  'checking',
  'sale',
  'warranty',
  'purchase',
  'request',
];

const OrderRecordSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  type: {
    allowNull: false,
    field: 'type',
    type: DataTypes.STRING(8),
    validate: {
      isIn: [['checking', 'checkout']],
    },
  },
  description: {
    allowNull: false,
    type: DataTypes.STRING(20),
    validate: {
      isIn: [actionType],
    },
  },
  acceptSign: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'accept_sign',
  },
  locationId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'location_id',
    references: {
      model: LOCATION_TABLE,
      key: 'id',
    },
  },
  notes: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  content: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  total: {
    allowNull: true,
    type: DataTypes.STRING(45),
  },
  delivered: {
    allowNull: true,
    type: DataTypes.BOOLEAN,
    field: 'delivered',
    defaultValue: true,
  },
  closed: {
    allowNull: true,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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

class OrderRecord extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });

    this.belongsTo(models.Location, {
      as: 'location',
      foreignKey: 'locationId',
      constraints: false,
    });
    this.belongsToMany(models.Assignment, {
      as: 'assignments',
      through: models.OrdersAssignments,
      otherKey: 'assignmentId',
      foreignKey: 'orderId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ORDERS_RECORDS_TABLE,
      modelName: 'OrderRecord',
      timestamps: true, 
paranoid: true
    };
  }
}

module.exports = {
  ORDERS_RECORDS_TABLE,
  OrderRecordSchema,
  OrderRecord,
};
