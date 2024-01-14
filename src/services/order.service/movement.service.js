const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class MovementService {
  async find({
    paranoid,
    all,
    orderType,
    movementType,
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
    if(!isNaN(startDate)){
      startDate = Number(startDate);
      endDate = Number(endDate);
    }
    const where = {
      ...(movementType && {
        type: movementType,
      }),
      ...(!all && {
        current: current == 'true' ? true : false,
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
      ...(category && {
        '$asset.model.category.name$': {
          [Op.like]: `%${category}%`,
        },
      }),
      ...(brand && {
        '$asset.model.brand.name$': {
          [Op.like]: `%${brand}%`,
        },
      }),
      ...(model && {
        '$asset.model.name$': {
          [Op.like]: `%${model}%`,
        },
      }),
      ...(groupId && {
        [Op.or]: [
          {
            '$to.group.id$': {
              [Op.in]: groupId,
            },
          },
          {
            '$from.group.id$': {
              [Op.in]: groupId,
            },
          },
        ],
      }),
      ...(location && {
        [Op.or]: [
          {
            '$to.code$': {
              [Op.like]: `%${location}%`,
            },
          },
          {
            '$to.name$': {
              [Op.like]: `%${location}%`,
            },
          },
          {
            '$to.rif$': {
              [Op.like]: `%${location}%`,
            },
          },
          {
            '$to.phone$': {
              [Op.like]: `%${location}%`,
            },
          },
        ],
      }),
      ...(group && {
        [Op.or]: [
          {
            '$to.group.name$': {
              [Op.like]: `%${group}%`,
            },
          },
          {
            '$to.group.code$': {
              [Op.like]: `%${group}%`,
            },
          },
        ],
      }),
    };
    const options = {
      order: [[sort, order]],
      ...(paranoid != undefined && {
        paranoid: paranoid == 'true' ? true : false,
      }),
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          model: models.Asset,
          as: 'asset',
          paranoid: false,
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
              include: [
                {
                  model: models.Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                },
                {
                  model: models.Brand,
                  as: 'brand',
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
        {
          model: models.OrderRecord,
          as: 'order',
          attributes: ['id', 'type', 'description'],
          where: {
            ...(orderType && {
              type: orderType,
            }),
          },
        },
        {
          model: models.Location,
          as: 'from',
          required: false,
          attributes: ['id', 'code', 'name', 'phone'],
          include: [
            {
              model: models.Group,
              as: 'group',
              attributes: ['id', 'name', 'code'],
            },
          ],
        },
        {
          model: models.Location,
          as: 'to',
          required: false,
          attributes: ['id', 'code', 'name', 'phone'],
          include: [
            {
              model: models.Group,
              as: 'group',
              attributes: ['id', 'name', 'code'],
            },
          ],
        },
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username']
        }
      ],
      attributes: ['id', 'quantity', 'type', 'current', 'createdAt'],
    };

    const { rows, count } = await models.Movement.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }
  async vFind({
    all,
    orderType,
    movementType,
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
    assetId,
    fromId,
    toId,
    orderId,
  }) {
    console.log(all);
    const where = {
      ...(movementType && {
        type: movementType,
      }),
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
      ...(serial && {
        serial: {
          [Op.like]: `%${serial}%`,
        },
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
      ...(orderType && {
        type: orderType,
      }),
      ...(category && {
        category: {
          [Op.like]: `%${category}%`,
        },
      }),
      ...(brand && {
        brand: {
          [Op.like]: `%${brand}%`,
        },
      }),
      ...(model && {
        model: {
          [Op.like]: `%${model}%`,
        },
      }),
      ...(location && {
        [Op.or]: [
          {
            toCode: {
              [Op.like]: `%${location}%`,
            },
          },
          {
            toName: {
              [Op.like]: `%${location}%`,
            },
          },
        ],
      }),
      ...(group && {
        [Op.or]: [
          {
            toGroupCode: {
              [Op.like]: `%${group}%`,
            },
          },
          {
            toGroupName: {
              [Op.like]: `%${group}%`,
            },
          },
        ],
      })
    };
    const options = {
      order: [[sort, order]],
      limit: Number(limit),
      offset: Number(offset),
      where,
      attributes: [
          'id',
          'orderId',
          'serial',
          'model',
          'category',
          'brand',
          'fromCode',
          'fromName',
          'toCode',
          'toName',
          'toGroupCode',
          'toGroupName',
          'type',
          'description',
          'current',
          'createdBy',
      ]
    };

    const { rows, count } = await models.VMovement.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }
}

module.exports = MovementService;
