const { Op } = require('sequelize');
const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const { maintenanceModel } = require('../../models');

class MaintenanceService {
  async create({ cost, description, assetId, maintenanceTypeId, createdById }) {
    const maintenance = await models.Maintenance.create({
      description,
      cost,
      assetId,
      maintenanceTypeId: maintenanceTypeId,
      createdById,
    });
    return await this.findOne(maintenance.id);
  }

  async find({
    description,
    cost,
    serial,
    model,
    brand,
    category,
    type,
    createdBy,
    startDate,
    groupId,
    endDate,
    limit = 10,
    offset = 0,
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
    }

    if (!isNaN(endDate)) {
      endDate = Number(endDate);
    }
    const where = {};

    if (description) {
      where.description = {
        [Op.like]: `%${description}%`,
      };
    }

    if (cost) {
      where.cost = cost;
    }

    if (serial) {
      where['$asset.serial$'] = {
        [Op.like]: `%${serial}%`,
      };
    }

    if (model) {
      where['$asset.model.name$'] = {
        [Op.like]: `%${model}%`,
      };
    }
    if (brand) {
      where['$asset.model.brand.name$'] = {
        [Op.like]: `%${brand}%`,
      };
    }
    if (category) {
      where['$asset.model.category.name$'] = {
        [Op.like]: `%${category}%`,
      };
    }
    if (type) {
      where['$maintenanceType.name$'] = {
        [Op.like]: `%${type}%`,
      };
    }
    if (createdBy) {
      where['$createdBy.username$'] = {
        [Op.like]: `%${createdBy}%`,
      };
    }

    if (groupId) {
      where['$asset.location.group_id$'] = groupId;
    }

    if (!isNaN(startDate)) {
      startDate = Number(startDate);
    }

    if (!isNaN(endDate)) {
      endDate = Number(endDate);
    }

    if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate).toISOString(),
      };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate).toISOString(),
      };
    }

    const { rows, count } = await models.Maintenance.findAndCountAll({
      where,
      include: maintenanceModel().include,
      limit: Number(limit),
      offset: Number(offset),
      attributes: maintenanceModel().attributes,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      rows: rows.map((row) => {
        delete row.dataValues.asset.dataValues.location;
        return row;
      }),
    };
  }

  async findOne(id, groupId) {
    console.log('id', id);
    const maintenance = await models.Maintenance.findByPk(id, {
      include: maintenanceModel().include,
      attributes: maintenanceModel().attributes,
      where: {
        ...(groupId && {
          '$asset.location.group_id$': 1,
        }),
      },
    });

    if (!maintenance) {
      throw boom.conflict('Maintenance not found');
    }
    return maintenance;
  }

  async update(id, changes) {
    const maintenance = await this.findOne(id);
    await maintenance.update(changes);
    return maintenance;
  }
}

module.exports = MaintenanceService;
