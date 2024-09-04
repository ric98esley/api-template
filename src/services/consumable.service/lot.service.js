const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const { lotModel, productHistoryModel } = require('../../models');

class LotService {
  constructor() {}

  async create({
    customer,
    type,
    description,
    createdById,
    movements = [],
    locationId,
  }) {
    const lot = await models.Lot.create(
      {
        customer,
        type,
        locationId,
        description,
        createdById,
        movements,
      },
      {
        include: ['movements'],
      }
    );
    return this.findOne({ id: lot.id });
  }
  async find({
    limit = 10,
    offset = 0,
    customer,
    type,
    description,
    locationId,
    groupId,
  }) {
    const where = {
      ...(customer && {
        customer: {
          [Op.like]: `%${customer}%`,
        },
      }),
      ...(type && {
        type,
      }),
      ...(description && {
        description: {
          [Op.like]: `%${description}%`,
        },
      }),
      ...(locationId && {
        locationId,
      }),
      ...(groupId && {
        '$location.group.id$': groupId,
      }),
    };
    const include = lotModel().include;
    const { rows, count } = await models.Lot.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
    });

    return {
      total: count,
      rows,
    };
  }
  async findOne({ id, locationId, groupId }) {
    const lot = await models.Lot.findOne({
      where: {
        id,
        ...(locationId && {
          locationId,
        }),
        ...(groupId && {
          '$location.group.id$': groupId,
        }),
      },
      include: lotModel().include,
    });

    return lot;
  }

  async findMovements({ id }) {
    const movements = await models.ProductHistory.findAll({
      where: {
        lotId: id,
      },
      include: productHistoryModel().include,
      attributes: productHistoryModel().attributes,
    });
    return movements;
  }
}

module.exports = LotService;
