const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const locationModel = require('../../models/location.model');

class LocationsServices {
  constructor() {}

  async create(data) {
    const newLocation = await models.Location.create(data);
    return await this.findOne({ id: newLocation.id });
  }

  async createMany(data) {
    const newLocations = await models.Location.bulkCreate(data, {
      returning: true,
      updateOnDuplicate: [
        'id',
        'code',
        'name',
        'phone',
        'rif',
        'address',
        'typeId',
        'zoneId',
        'managerId',
        'groupId',
        'createdById',
      ],
      fields: [
        'id',
        'code',
        'name',
        'phone',
        'rif',
        'address',
        'createdById',
        'typeId',
        'zoneId',
        'managerId',
        'groupId',
      ],
    });
    return newLocations;
  }

  async findOne({ id, groupId }) {
    const options = {
      where: {
        ...(groupId && {
          groupId,
        }),
        id,
      },
      include: locationModel().include,
      attributes: locationModel().attributes,
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
    status,
    rif,
    address,
    group,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    groupId,
    zone,
    zoneId,
    type,
    typeId,
    manager,
    managerId,
    startDate,
    endDate,
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }

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
      ...(zone && {
        '$zone.name$': {
          [Op.like]: `%${zone}%`,
        },
      }),
      ...(typeId && {
        typeId,
      }),
      ...(type && {
        '$type.name$': {
          [Op.like]: `%${type}%`,
        },
      }),
      ...(manager && {
        [Op.or]: [
          {
            '$manager.name$': {
              [Op.like]: `%${manager}%`,
            },
          },
          {
            '$manager.last_name$': {
              [Op.like]: `%${manager}%`,
            },
          },
        ],
      }),
      ...(managerId && {
        managerId,
      }),
      ...(rif && {
        rif: {
          [Op.like]: `%${rif}%`,
        },
      }),
      ...(startDate && {
        createdAt: {
          [Op.gte]: new Date(startDate).toISOString(),
        },
      }),
      ...(endDate && {
        createdAt: {
          [Op.lte]: new Date(endDate).toISOString(),
        },
      }),
      ...(group && {
        [Op.or]: [
          {
            '$group.name$': {
              [Op.like]: `%${group}%`,
            },
          },
          {
            '$group.code$': {
              [Op.like]: `%${group}%`,
            },
          },
        ],
      }),
      ...(status && {
        '$type.status$': status.split(','),
      }),
    };
    const options = {
      where,
      limit: Number(limit),
      offset: Number(offset),
      include: locationModel().include,
      attributes: locationModel().attributes,
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

    await location.update(changes);
    return await this.findOne({ id, groupId });
  }

  async delete(id) {
    const location = await this.findOne({ id });
    const rta = await location.destroy();
    return rta;
  }
}

module.exports = LocationsServices;
