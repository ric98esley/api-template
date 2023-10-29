const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class MovementService {
  async find({
    paranoid,
    all,
    current,
    location,
    group,
    serial,
    category,
    model,
    brand,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    startDate,
    endDate,
    groupId,
    assetId,
    fromId,
    toId,
    orderId,
  }) {
    console.log(all)
    const where = {
      ...(!all && {
        current: current ? true : false,
      }),
      ...(toId && {
        toId,
      }),
      ...(fromId && {
        fromId,
      }),
      ...(assetId && {
        assetId,
      }),
      ...(orderId && {
        orderId,
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [
              new Date(startDate).toISOString(),
              new Date(endDate).toISOString(),
            ],
          },
        }),
    };
    const options = {
      order: [[sort, order]],
      ...(paranoid && {
        paranoid: false,
      }),
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          model: models.Asset,
          as: 'asset',
          ...(serial && {
            where: {
              serial: {
                [Op.like]: `%${serial}%`,
              },
            },
          }),
          attributes: ['id', 'serial'],
          include: [
            {
              model: models.Model,
              as: 'model',
              attributes: ['id', 'name'],
              ...(model && {
                where: {
                  name: {
                    [Op.like]: `%${model}%`,
                  },
                },
              }),
              include: [
                {
                  model: models.Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                  ...(category && {
                    where: {
                      name: {
                        [Op.like]: `%${category}%`,
                      },
                    },
                  }),
                },
                {
                  model: models.Brand,
                  as: 'brand',
                  attributes: ['id', 'name'],
                  ...(brand && {
                    where: {
                      name: {
                        [Op.like]: `%${brand}%`,
                      },
                    },
                  }),
                },
              ],
            },
          ],
        },
        {
          model: models.OrderRecord,
          as: 'order',
          attributes: ['id', 'type', 'description'],
        },
        {
          model: models.Location,
          as: 'from',
          required: false,
          attributes: ['id', 'code', 'name', 'phone'],
          where: {
            ...(group && {
              group: {
                [Op.like]: `%${group}%`,
              },
            }),
            ...(groupId && {
              groupId,
            }),
            ...(location && {
              [Op.or]: [
                {
                  code: {
                    [Op.like]: `%${location}%`,
                  },
                },
                {
                  name: {
                    [Op.like]: `%${location}%`,
                  },
                },
                {
                  rif: {
                    [Op.like]: `%${location}%`,
                  },
                },
                {
                  phone: {
                    [Op.like]: `%${location}%`,
                  },
                },
              ],
            }),
          },
        },
        {
          model: models.Location,
          as: 'to',
          required: false,
          attributes: ['id', 'code', 'name', 'phone'],
        },
      ],
      attributes: ['id', 'quantity', 'current', 'createdAt'],
    };

    const { rows, count } = await models.Movement.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }
}

module.exports = MovementService;
