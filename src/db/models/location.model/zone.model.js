const { Model, DataTypes, Sequelize } = require("sequelize");

const ZONE_TABLE = "zones";

const { USER_TABLE } = require('../user.model')

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

const ZoneSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    field: "name",
    type: DataTypes.STRING(100),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    }
  },
  createdById: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: "created_by_id",
    references: {
      model: USER_TABLE,
      key: "id",
    },
    onUpdate: "RESTRICT",
    onDelete: "RESTRICT"
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

class Zone extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: "createdBy", foreignKey: "createdById" });
    this.hasMany(models.Location, { as: "locations", foreignKey: "id" })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ZONE_TABLE,
      modelName: "Zone",
      timestamps: true, 
paranoid: true
    };
  }
}

module.exports = { ZONE_TABLE, ZoneSchema, Zone };
