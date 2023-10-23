const { Model, DataTypes, Sequelize } = require('sequelize');

const WAREHOUSE_TABLE = 'warehouses';
const { USER_TABLE } = require('../user.model');
const { GROUP_TABLE } = require('../group.model');
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

// List with permited status

const status = ['desplegable', 'pendiente', 'archivado']

const WarehouseSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(50),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  state: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      isIn: [status],
    },
  },
  groupId: {
    allowNull: true,
    field: 'group_id',
    type: DataTypes.INTEGER,
    references: {
      model: GROUP_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
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

class Warehouse extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.belongsTo(models.Group, { as: 'group' , foreignKey: 'groupId'});
    // this.belongsToMany(models.Movement, { through: models.WarehouseProducts, foreignKey: 'depositId'});
    this.hasMany(models.Asset, { as: 'assets', foreignKey: 'depositId'});
  }


  static config(sequelize) {
    return {
      sequelize,
      tableName: WAREHOUSE_TABLE,
      modelName: 'Warehouse',
      timestamps: true,
    };
  }
}

module.exports = { WAREHOUSE_TABLE, WarehouseSchema, Warehouse };
