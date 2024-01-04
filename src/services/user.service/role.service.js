const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');

class RoleService {
  async create(data) {
    const newRole = await models.Role.create(data, {
      include: ['permissions'],
    });
    return newRole;
  }

  async findOne({ id, name }) {
    const options = {
      include: [
        {
          as: 'permissions',
          model: models.Permission,
          attributes: [
            'id',
            'name',
            'scope',
            'capability',
            'possession',
            'createdAt',
          ],
        },
      ],
      where: {
        ...(id && {
          id,
        }),
        ...(name && {
          name,
        }),
      },
      attributes: ['id', 'name', 'createdAt'],
    };

    const role = await models.Role.findOne(options);

    if (!role) {
      throw boom.notFound('Role not found');
    }

    return role;
  }

  async find({ name, limit = 10, offset = 0 }) {
    const where = {
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          as: 'permissions',
          model: models.Permission,
          attributes: [
            'id',
            'name',
            'scope',
            'capability',
            'possession',
            'createdAt',
          ],
        },
      ],
      attributes: ['id', 'name', 'createdAt'],
    };

    const { rows, count } = await models.Role.findAndCountAll(options);

    return {
      total: count,
      rows,
    };
  }

  async update({ id, data }) {
    const role = await this.findOne({ id });

    const updatedRole = await role.update(data);
    return updatedRole;
  }

  async delete({ id }) {
    const role = await this.findOne({ id });
    await role.destroy();
    return { message: 'Role deleted' };
  }
}

module.exports = RoleService;
