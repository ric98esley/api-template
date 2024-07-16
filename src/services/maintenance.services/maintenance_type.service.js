const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');

class MaintenanceTypeService {
  async create({ name, description, createdById }) {
    const maintenanceType = await models.MaintenanceType.create({
      name,
      description,
      createdById,
    });
    return maintenanceType;
  }

  async find({ name, description, limit = 10, offset = 0 }) {
    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (description) {
      where.description = { [Op.like]: `%${description}%` };
    }

    const include = [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'username'],
      },
    ];

    const options = {
      where,
      include,
      attributes: ['id', 'name', 'description'],
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
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
      ],
    });
    return maintenanceType;
  }

  async update(id, changes) {
    const maintenanceType = await this.getById({ id });

    if (!maintenanceType) {
      throw new Error('Maintenance Type not found');
    }

    await maintenanceType.update(changes);

    return maintenanceType;
  }

  async delete({ id }) {
    const type = await this.getById({ id });
    if (!type) {
      throw new Error('Maintenance Type not found');
    }
    await type.destroy();
    return type;
  }
}

module.exports = MaintenanceTypeService;
