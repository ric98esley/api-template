const { Model, DataTypes, Sequelize } = require("sequelize");

const MODEL_TABLE = "models";
const { USER_TABLE } = require("../user.model");
const { CATEGORY_TABLE } = require("./category.model");
const { ASSET_BRAND_TABLE } = require("./brand.model");
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

const ModelSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING(45),
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  categoryId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: "category_id",
    references: {
      model: CATEGORY_TABLE,
      key: "id",
    },
    onUpdate: "RESTRICT",
    onDelete: "RESTRICT",
  },
  brandId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: "brand_id",
    references: {
      model: ASSET_BRAND_TABLE,
      key: "id",
    },
    onUpdate: "RESTRICT",
    onDelete: "RESTRICT",
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: "created_by",
    references: {
      model: USER_TABLE,
      key: "id",
    },
    onUpdate: "RESTRICT",
    onDelete: "RESTRICT",
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

class Model extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: "createdBy", foreignKey: "createdById" });
    this.hasMany(models.Asset, {as: "assets" , foreignKey: "modelId"})
    this.belongsTo(models.Category, { as: "category", foreignKey: "categoryId" });
    this.belongsTo(models.Brand, { as: "brand", foreignKey: "brandId" });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MODEL_TABLE,
      modelName: "Model",
      timestamps: true,
    };
  }
}

module.exports = { MODEL_TABLE, ModelSchema, Model };
