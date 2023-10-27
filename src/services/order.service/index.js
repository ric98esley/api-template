const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, fn, col } = require('sequelize');

class OrderRecordService {
  constructor() {}

  async createAssignments({
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
      movements.push({
        assetId: target.assetId,
        quantity: 1,
        to: locationId,
        from: asset.dataValues.locationId,
        createdById,
      });
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

    const updateAssets = await models.Asset.update(
      { locationId },
      {
        where: {
          id: assets,
        },
      }
    );

    return newRecord;
  }

  async acceptTransaction({ id, sign }) {
    const record = await models.OrderRecord.findByPk(id);
    record.update({ acceptSign: sign });
  }
  async find({
    locationId,
    sort = 'createdAt',
    order = 'DESC',
    limit,
    offset,
    startDate,
    endDate,
    type,
    description,
  }) {
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
      ...(description && {
        description: { [Op.like]: `%${description}%` },
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
          attributes: ['id', 'code', 'name', 'phone'],
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
        [fn('COUNT', col('OrderRecord.id')), 'count'],
        'description',
        'delivered',
        'closed',
        'createdAt',
      ],
    };
    const count = await models.OrderRecord.count(options);
    options.include.push(        {
      model: models.Movement,
      as: 'movements',
      attributes: [],
    })
    options.group = ['OrderRecord.id']
    const rows = await models.OrderRecord.findAll(options);
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
          attributes: []
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
