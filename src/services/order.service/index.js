const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../../libs/sequelize');

class OrderRecordService {
  constructor() {}

  async createAssignments({
    movementType = 'asset',
    type,
    description,
    notes,
    content,
    locationId,
    createdById,
    targets,
  }) {
    const movements = [];

    for (const target of targets) {
      const asset = await models.Asset.findByPk(target.assetId, {
        paranoid: false,
      });
      if (asset) {
        movements.push({
          assetId: target.assetId,
          quantity: 1,
          type: movementType,
          toId: target.locationId,
          fromId: asset.dataValues.locationId,
          createdById,
        });

        asset.update({ locationId: target.locationId });
      }
    }

    const assets = targets.map((asset) => asset.assetId);
    const updateOldMovements = await models.Movement.update(
      { current: 0 },
      {
        where: {
          assetId: assets,
          current: 1,
        },
      }
    );

    const toCreate = {
      type,
      description,
      notes,
      content,
      locationId,
      createdById,
      movements,
    };

    const newRecord = await models.OrderRecord.create(toCreate, {
      include: ['movements'],
    });

    return newRecord;
  }

  async acceptTransaction({ id, sign }) {
    const record = await models.OrderRecord.findByPk(id);
    record.update({ acceptSign: sign });
  }
  async find({
    locationId,
    location,
    sort = 'createdAt',
    order = 'DESC',
    startDate,
    groupId,
    endDate,
    type,
    description,
    notes,
    limit = 10,
    offset = 0,
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

    const orders = await sequelize.query(`
      SELECT 
        orders.id,
        orders.type,
          orders.description,
          orders.notes,
          orders.content,
          orders.delivered,
          orders.closed,
          orders.created_at as 'createdAt',
          location.id as 'location.id',
          location.code as 'location.code',
          location.\`type.id\` as 'location.type.id',
          location.\`type.name\` as 'location.type.name',
          location.\`zone.id\` as 'location.zone.id',
          location.\`zone.name\` as 'location.zone.name',
          users.id as 'createdBy.id',
          users.username as 'createdBy.username'
          FROM orders
              left join users on orders.created_by_id = users.id
              left join movements on movements.order_id = orders.id
              left join locations as \`to\` on movements.to_id = \`to\`.id
              left join locations as \`from\` on movements.from_id = \`from\`.id
              left join ( select
            locations.id,
                  locations.code,
                  locations.name,
                  location_types.id as 'type.id',
                  location_types.name as 'type.name',
                  zones.id as 'zone.id',
                  zones.name as 'zone.name'
                  from locations
                  left join location_types on locations.type_id = location_types.id
                  left join zones on locations.zone_id = zones.id
              ) as location on location.id = orders.location_id
              where \`to\`.group_id in (133) or \`from\`.group_id in (133)
          group by orders.id
              order by id desc;
      `);
    const where = {
      ...(locationId && {
        locationId,
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        }),
      ...(type && {
        type,
      }),
      ...(notes && {
        notes: {
          [Op.like]: `%${notes}%`,
        },
      }),
      ...(description && {
        description: {
          [Op.like]: `%${description}%`,
        },
      }),
    };
    const options = {
      ...(limit && { limit: Number(limit) }),
      ...(offset && { offset: Number(offset) }),
      where,
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Movement,
          as: 'movements',
          nested: false,
          include: [
            {
              model: models.Location,
              as: 'to',
              include: {
                model: models.Group,
                as: 'group',
                required: true,
                where: {
                  ...(groupId && {
                    group: literal(
                      '`movements->to->group`.`id` in (' + groupId + ')'
                    ),
                  }),
                },
              },
            },
          ],
          // attributes: [],
        },
        {
          model: models.Location,
          as: 'location',
          required: false,
          attributes: [
            'id',
            'code',
            'name',
            'phone',
            'groupId',
            'typeId',
            'zoneId',
            'managerId',
          ],
          where: {
            ...(location && {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${location}%`,
                  },
                },
                {
                  code: {
                    [Op.like]: `%${location}%`,
                  },
                },
              ],
            }),
          },
          include: [
            {
              model: models.LocationType,
              as: 'type',
              attributes: ['id', 'name'],
            },
            {
              model: models.Zone,
              as: 'zone',
              attributes: ['id', 'name'],
            },
            {
              model: models.Customer,
              as: 'manager',
            },
          ],
        },
      ],
      distinct: true,
      order: [[sort, order]],
      attributes: [
        'id',
        'type',
        [
          literal(
            `(SELECT count(*)
              FROM movements as movements
                  where
              order_id = OrderRecord.id)`
          ),
          'count',
        ],
        'description',
        'notes',
        'content',
        'delivered',
        'closed',
        'createdAt',
      ],
      limit: Number(limit),
      offset: Number(offset),
    };
    const { count, rows } = await models.OrderRecord.findAndCountAll(options);
    return {
      total: count,
      rows: orders,
    };
  }

  async addAssignmentsToOrder({ orderId, assignments }) {
    const orderHasAssets = assignments.map((target) => ({
      assignmentId: target.id,
      orderId,
    }));

    const createdAssets = await models.OrdersAssignments.bulkCreate(
      orderHasAssets
    );
    return createdAssets;
  }

  async findOne({ id, groupId }) {
    const order = await models.OrderRecord.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Location,
          as: 'location',
          include: [
            {
              model: models.Group,
              as: 'group',
              attributes: ['id', 'name', 'code'],
            },
            {
              model: models.Customer,
              as: 'manager',
              attributes: ['id', 'name', 'lastName', 'phone'],
            },
            {
              model: models.LocationType,
              as: 'type',
              attributes: ['id', 'name', 'status'],
            },
            {
              model: models.Zone,
              as: 'zone',
              attributes: ['id', 'name'],
            },
          ],
          attributes: [
            'id',
            'code',
            'name',
            'isActive',
            'phone',
            'rif',
            'address',
          ],
        },
        {
          model: models.Movement,
          as: 'movements',
          nested: false,
          include: [
            {
              model: models.Location,
              as: 'to',
              where: {
                groupId,
              },
            },
            'from',
          ],
          // attributes: [],
        },
      ],
      group: ['OrderRecord.id'],
      attributes: [
        'id',
        'type',
        'description',
        'content',
        'notes',
        [fn('COUNT', col('OrderRecord.id')), 'count'],
        'delivered',
        'closed',
        'createdAt',
      ],
    });

    if (!order) {
      throw boom.notFound('Order not found');
    }
    return order;
  }

  async addAssignmentToOrder({ idOrder, idAsset }) {
    const addAssignment = await models.OrderAsset.create({
      OrderRecordId: idOrder,
      assetAssignmentId: idAsset,
    });
    return addAssignment;
  }
  async removeAssignmentToOrder({ idOrder, idAsset }) {
    const removeAssignment = await models.OrderAsset.findOne({
      where: {
        OrderRecordId: idOrder,
        assetAssignmentId: idAsset,
      },
    });
    return removeAssignment;
  }
}

module.exports = OrderRecordService;
