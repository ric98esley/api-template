const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, fn, col, literal } = require('sequelize');

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
    const assets = targets.map((asset) => asset.assetId);

    const movements = [];

    for (const target of targets) {
      const asset = await models.Asset.findByPk(target.assetId);
      if (!asset) {
        throw boom.notFound('El activo no existe ' + target.assetId);
      }
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
          model: models.Location,
          as: 'location',
          attributes: [
            'id',
            'code',
            'name',
            'phone',
            'typeId',
            'zoneId',
            'managerId',
          ],
          ...(location && {
            where: {
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
            },
          }),
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
      rows,
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

  async findOne({ id }) {
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
          attributes: [],
        },
      ],
      group: ['OrderRecord.id'],
      attributes: [
        'id',
        'type',
        'description',
        'content',
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
