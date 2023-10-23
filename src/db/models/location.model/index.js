const { Model, DataTypes, Sequelize } = require('sequelize');

const LOCATION_TABLE = 'locations';
const { ZONE_TABLE } = require('./zone.model');
const { USER_TABLE } = require('../user.model');
const { LOCATION_TYPE_TABLE } = require('./type.model');
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

const LocationSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER,
  },
  code: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING(50),
    unique: true,
    set(value) {
      this.setDataValue('code', value.trim().toUpperCase());
    },
  },
  name: {
    allowNull: false,
    field: 'name',
    type: DataTypes.STRING(100),
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim().toUpperCase());
    },
  },
  typeId: {
    allowNull: false,
    field: 'type_id',
    type: DataTypes.INTEGER,
    references: {
      model: LOCATION_TYPE_TABLE,
      key: 'id',
    },
  },
  groupId: {
    allowNull: false,
    field: 'group_id',
    type: DataTypes.INTEGER,
    references: {
      model: GROUP_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  phone: {
    allowNull: true,
    type: DataTypes.STRING(15),
  },
  rif: {
    allowNull: true,
    type: DataTypes.STRING(30),
  },
  address: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  isActive: {
    field: 'active',
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  parentId: {
    field: 'parent_id',
    allowNull: true,
    type: DataTypes.INTEGER,
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  managerId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'manager_id',
    references: {
      model: USER_TABLE,
      key: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  },
  zoneId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'zone_id',
    references: {
      model: ZONE_TABLE,
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

class Location extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    this.belongsTo(models.User, { as: 'manager', foreignKey: 'managerId' });
    this.belongsTo(models.Zone, { as: 'zone', foreignKey: 'zoneId' });
    this.belongsTo(models.Location, { as: 'parent', foreignKey: 'parentId' });
    this.belongsTo(models.Group, { as: 'group', foreignKey: 'groupId' });
    this.belongsTo(models.LocationType, { as: 'type', foreignKey: 'typeId' });
    this.hasMany(models.Assignment, {
      as: 'assignments',
      foreignKey: 'locationId',
    });
    this.hasMany(models.Assignment, {
      as: 'oldAssignments',
      foreignKey: 'locationId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: LOCATION_TABLE,
      modelName: 'Location',
      timestamps: true,
    };
  }
}

module.exports = { LOCATION_TABLE, LocationSchema, Location };
