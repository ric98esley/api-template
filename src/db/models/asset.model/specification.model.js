const { Model, DataTypes } = require('sequelize');
const { USER_TABLE } = require('../user.model');


const HARDWARE_SPEC_TABLE = 'hardware_specifications';
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

const HardwareSpecSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(45),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
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
  updatedById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'updated_by_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  deletedById: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'deleted_by_id',
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

class HardwareSpec extends Model {
  static associate(models) {
    this.belongsToMany(models.Category, {
      as: 'categories',
      through: models.CategorySpecification,
      foreignKey: 'type_id'
    })
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById'
    })
    this.belongsTo(models.User, {
      as: 'updatedBy',
      foreignKey: 'updatedById'
    })
  }

  static config(sequelize) {

    return {
      sequelize,
      tableName: HARDWARE_SPEC_TABLE,
      modelName: 'HardwareSpec',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { HARDWARE_SPEC_TABLE, HardwareSpecSchema, HardwareSpec };
