const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');

class HardwareSpecificationsServices {
  constructor() {}

  userId(user) {
    return user.sub;
  }

  async create({ data, user }) {
    const toCreate = {
      name: data.name,
      createdById: this.userId(user),
      updatedById: this.userId(user),
    };

    const newSpecification = await models.HardwareSpec.create(toCreate);

    return newSpecification;
  }

  async findOne({ id }) {
    const options = {
      attributes: ['id', 'name', 'createdAt'],
    };
    const specification = await models.HardwareSpec.findByPk(id, options);
    if (!specification) {
      throw boom.notFound('Specification not found');
    }
    return specification;
  }

  async find({ name, limit, offset, sort = 'createdAt', order = 'DESC' }) {
    const options = {
      ...(limit && {
        limit: Number(limit),
      }),
      ...(offset && {
        offset: Number(offset),
      }),
      where: {
        ...(name && {
          name: {
            [Op.like]: `%${name}%`,
          },
        }),
      },
      order: [[sort, order]],
      attributes: ['id', 'name', 'createdAt'],
    };
    const { rows, count } = await models.HardwareSpec.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }

  async update({ data, user, id }) {
    const specification = await this.findOne({ id });

    const toUpdate = {
      name: data.name,
      updatedById: this.userId(user),
    };

    const rta = specification.update(toUpdate);

    return rta;
  }

  async delete({ id, user }) {
    const specification = await this.findOne({ id });
    specification.update({
      deletedById: this.userId(user),
    });

    const rta = await specification.destroy();

    return rta;
  }
}

module.exports = HardwareSpecificationsServices;
