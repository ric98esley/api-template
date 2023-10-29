const { Model, DataTypes, Sequelize } = require('sequelize');

const { USER_TABLE } = require('../user.model');
const { CATEGORY_TABLE } = require('../category.model');

const PRODUCT_TABLE = 'products';
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

const ProductSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  code: {
    allowNull: false,
    type: DataTypes.STRING(25),
    unique: true,
    set(value) {
      this.setDataValue('code', value.trim().toUpperCase());
    }
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(45),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  price: {
    allowNull: true,
    type: DataTypes.STRING(45),
  },
  unit: {
    allowNull: false,
    type: DataTypes.STRING(10),
  },
  description: {
    allowNull: true,
    type: DataTypes.TEXT,
    set(value) {
      if(value) this.setDataValue('description', value.trim());
    }
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

class Product extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.belongsTo(models.Category, {
      as: 'category',
      foreignKey: 'categoryId',
    });
    this.belongsToMany(models.Movement, {
      as: 'movements',
      through: models.WarehouseProducts,
      foreignKey: 'productId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PRODUCT_TABLE,
      modelName: 'Product',
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { PRODUCT_TABLE, ProductSchema, Product };
