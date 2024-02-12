const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

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
    return lot;
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
    const include = [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'username'],
      },
      {
        model: models.Location,
        as: 'location',
        attributes: [ 'id' , 'code', 'name'],
        include: [
          {
            model: models.Group,
            as: 'group',
            attributes: ['id', 'code', 'name'],
          },
        ],
      },
    ];
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
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.ProductHistory,
          as: 'movements',
          attributes: ['id', 'quantity', 'createdAt'],
          include: [
            {
              model: models.LocationProducts,
              as: 'target',
              attributes: ['id', 'quantity', 'min', 'createdAt'],
              include: [
                {
                  model: models.Product,
                  as: 'product',
                  attributes: ['id', 'code', 'name', 'unit', 'description'],
                  include: [
                    {
                      model: models.Category,
                      as: 'category',
                      attributes: ['id', 'name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return lot;
  }
}

module.exports = LotService;
