const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, literal } = require('sequelize');
const sequelize = require('../../libs/sequelize');

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
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }

    if (all == 'false') all = false;
    if (all == 'true') all = true;

    const where = {
      ...(movementType && {
        type: movementType,
      }),
      ...(!all && {
        current: current == 'true' ? true : false,
      }),
      ...(toId && {
        toId: Number(toId),
      }),
      ...(fromId && {
        fromId: Number(fromId),
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
          [Op.or]: category.split(',').map((c) => ({
            [Op.like]: `%${c}%`,
          })),
        },
      }),
      ...(brand && {
        '$asset.model.brand.name$': {
          [Op.or]: brand.split(',').map((b) => ({
            [Op.like]: `%${b}%`,
          })),
        },
      }),
      ...(model && {
        '$asset.model.name$': {
          [Op.or]: model.split(',').map((m) => ({
            [Op.like]: `%${m}%`,
          })),
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
      ...(serial && {
        '$asset.serial$': {
          [Op.like]: `%${serial}%`,
        },
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
          attributes: ['id', 'serial'],
          include: [
            {
              model: models.Model,
              as: 'model',
              attributes: ['id', 'name'],
              paranoid: false,
              include: [
                {
                  model: models.Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                  paranoid: false,
                },
                {
                  model: models.Brand,
                  as: 'brand',
                  attributes: ['id', 'name'],
                  paranoid: false,
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
          attributes: ['id', 'username'],
        },
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
    if (all == 'false') all = false;
    if (all == 'true') all = true;

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
      ...(model && {
        model: {
          [Op.or]: model.split(',').map((m) => ({
            [Op.like]: `%${m}%`,
          })),
        },
      }),
      ...(category && {
        category: {
          [Op.or]: category.split(',').map((c) => ({
            [Op.like]: `%${c}%`,
          })),
        },
      }),
      ...(brand && {
        brand: {
          [Op.or]: brand.split(',').map((b) => ({
            [Op.like]: `%${b}%`,
          })),
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
      }),
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
      ],
    };

    const { rows, count } = await models.VMovement.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }

  async getByLocations({
    limit = 10,
    offset = 0,
    startDate = '',
    endDate = '',
    search = '',
    orderType = '',
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }

    if (startDate == '' || endDate == '') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    }

    startDate = new Date(startDate)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', '')
      .split('.')[0];
    endDate = new Date(endDate)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', '')
      .split('.')[0];

    const locations = await sequelize.query(
      `SELECT
          locations.id,
          locations.code,
          locations.name,
          locations.phone,
          groups_t.name as 'group.name',
          groups_t.code as 'group.code',
          COUNT(movements.id) as total
        FROM movements
          left join locations on movements.to_id = locations.id
          left join orders on orders.id = movements.order_id
          left join groups_t on groups_t.id = locations.group_id
            WHERE locations.deleted_at is null and
              movements.deleted_at is null and
              movements.created_at BETWEEN $startDate and $endDate
              and (locations.code like $search or locations.name like $search)
              and orders.type like $orderType
        GROUP BY locations.id
        ORDER BY locations.name ASC
        LIMIT $limit OFFSET $offset
        `,
      {
        nest: true,
        bind: {
          limit,
          offset,
          startDate: `${startDate}`,
          endDate: `${endDate}`,
          search: `%${search}%`,
          orderType: `%${orderType}%`,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const count = await sequelize.query(
      `SELECT
          COUNT(locations.id) as total
        FROM movements
          left join locations on movements.to_id = locations.id
          left join orders on orders.id = movements.order_id
          left join groups_t groups on groups.id = locations.group_id
            WHERE locations.deleted_at is null and
              movements.deleted_at is null and
              movements.created_at BETWEEN $startDate and $endDate
              and (locations.code like $search or locations.name like $search)
        `,
      {
        nest: true,
        bind: {
          startDate: `${startDate}`,
          endDate: `${endDate}`,
          search: `%${search}%`,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      total: count[0].total,
      rows: locations,
    };
  }
}

module.exports = MovementService;
