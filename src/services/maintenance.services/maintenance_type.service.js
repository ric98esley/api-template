const { Op } = require('sequelize');
const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { maintenanceTypeModel } = require('../../models');

class MaintenanceTypeService {
  async create({ name, description, createdById }) {
    const maintenanceType = await models.MaintenanceType.create({
      name,
      description,
      createdById,
    });

    return await this.getById({ id: maintenanceType.id });
  }

  async find({ name, description, limit = 10, offset = 0 }) {
    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (description) {
      where.description = { [Op.like]: `%${description}%` };
    }

    const include = maintenanceTypeModel().include;

    const options = {
      where,
      include,
      attributes: maintenanceTypeModel().attributes,
      order: [['id', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
    };

    const { rows, count } = await models.MaintenanceType.findAndCountAll(
      options
    );
    return {
      total: count,
      rows,
    };
  }

  async getById({ id }) {
    const maintenanceType = await models.MaintenanceType.findByPk(id, {
      include: maintenanceTypeModel().include,
      attributes: maintenanceTypeModel().attributes,
      paranoid: false,
    });

    if (!maintenanceType) {
      throw boom.conflict('Maintenance Type not found');
    }
    return maintenanceType;
  }

  async update(id, changes) {
    const maintenanceType = await this.getById({ id });

    await maintenanceType.update(changes);

    return maintenanceType;
  }

  async delete({ id }) {
    const type = await this.getById({ id });

    await type.destroy();
    return type;
  }
}

module.exports = MaintenanceTypeService;
