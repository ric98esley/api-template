const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
// const AssignmentService = require('../orders.service/assignments.service');
// const assignmentsService = new AssignmentService();

class LocationsServices {
  constructor() {}

  async create(data) {
    const newLocation = await models.Location.create(data);
    return newLocation;
  }

  async findOne({ id, groupId }) {
    const options = {
      where: {
        ...(groupId && {
          groupId,
        }),
        id,
      },
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'name', 'lastName', 'username'],
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name', 'code'],
        },
        {
          model: models.User,
          as: 'manager',
          attributes: ['id', 'name', 'lastName', 'username'],
        },
        {
          model: models.Zone,
          as: 'zone',
        },
        'type',
      ],
      attributes: {
        exclude: [
          'createdById',
          'managerId',
          'zoneId',
          'locationParent',
          'groupId',
        ],
      },
    };
    const location = await models.Location.findOne(options);
    if (!location) {
      throw boom.notFound('Location not found');
    }
    return location;
  }

  async find({
    search,
    code,
    name,
    rif,
    address,
    group,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    groupId,
    zoneId,
    typeId,
    managerId,
    startDate,
    endDate,
  }) {
    const where = {
      ...(search && {
        [Op.or]: [
          {
            code: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            rif: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            address: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(code && {
        code: {
          [Op.like]: `%${code}%`,
        },
      }),
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
      ...(address && {
        address: {
          [Op.like]: `%${address}%`,
        },
      }),
      ...(groupId && {
        groupId,
      }),
      ...(zoneId && {
        zoneId,
      }),
      ...(typeId && {
        typeId,
      }),
      ...(managerId && {
        managerId,
      }),
      ...(rif && {
        rif: {
          [Op.like]: `%${rif}%`,
        },
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        }),
    };
    const options = {
      where,
      limit: Number(limit),
      offset: Number(offset),
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: {
            exclude: [
              'password',
              'phone',
              'cardId',
              'createdById',
              'managerId',
              'locationId',
              'address',
              'createdAt',
            ],
          },
        },
        {
          model: models.Group,
          as: 'group',
          ...(group && {
            where: {
              name: {
                [Op.like]: `%${group}%`,
              },
            },
          }),
        },
        {
          model: models.User,
          as: 'manager',
          attributes: {
            exclude: [
              'password',
              'phone',
              'cardId',
              'createdById',
              'managerId',
              'locationId',
              'address',
              'createdAt',
            ],
          },
        },
        {
          model: models.Zone,
          as: 'zone',
        },
        'type',
      ],
      attributes: {
        exclude: [
          'createdById',
          'managerId',
          'zoneId',
          'locationParent',
          'groupId',
        ],
      },
      order: [[sort, order]],
    };
    const { count, rows } = await models.Location.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }

  async update({ id, changes, groupId }) {
    const location = await this.findOne({ id, groupId });

    const rta = await location.update(changes);
    return rta;
  }

  async delete(id) {
    const location = await this.findOne({ id });
    const rta = await location.destroy();
    return rta;
  }
}

module.exports = LocationsServices;
