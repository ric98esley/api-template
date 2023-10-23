const { Model, DataTypes } = require('sequelize');

const CATEGORY_TABLE = 'categories';
const { USER_TABLE } = require('../user.model');

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

const category_types = ['asset', 'accessory', 'consumable']

const CategorySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    field: 'name',
    type: DataTypes.STRING(45),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  type:{
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: category_types
    },
    set(value) {
      this.setDataValue('type', value.trim());
    },
    defaultValue: 'asset',
  },
  description: {
    allowNull: true,
    type: DataTypes.TEXT,
    set(value) {
      if(value) this.setDataValue('description', value.trim());
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

class Category extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'createdById',
    });
    this.belongsToMany(models.HardwareSpec, {
      through: models.CategorySpec,
      as: 'customFields',
      foreignKey: 'category_id'
    });
    this.belongsToMany(models.Brand, {
      through: models.Model,
      as: 'brands',
      foreignKey: 'category_id'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORY_TABLE,
      modelName: 'Category',
      timestamps: true,
    };
  }
}

module.exports = { CATEGORY_TABLE, CategorySchema, Category };
