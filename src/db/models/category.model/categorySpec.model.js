const { Model, DataTypes, Sequelize } = require('sequelize');

const CATEGORY_SPEC_TABLE = 'category_specifications';
const { CATEGORY_TABLE } = require('.');
const { HARDWARE_SPEC_TABLE } = require('../asset.model/specification.model');

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

const CategorySpecSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  categoryId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'category_id',
    references: {
      model: CATEGORY_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  typeId: {
    allowNull: false,
    field: 'type_id',
    type: DataTypes.INTEGER,
    references: {
      model: HARDWARE_SPEC_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class CategorySpec extends Model {
  static associate(models) {
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORY_SPEC_TABLE,
      modelName: 'CategorySpec',
      timestamps: false,
    };
  }
}

module.exports = { CATEGORY_SPEC_TABLE, CategorySpecSchema, CategorySpec };
