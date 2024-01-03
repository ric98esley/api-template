const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');


class PermissionServices {
  async create(data) {
    const newPermission = await models.Permission.create(data);
    return newPermission;
  }

  async findOne({ id, role }) {
    const options = {
      where: {
        ...(id && {
          id,
        }),
        ...(role && {
          role,
        }),
      },
      attributes: ['id', 'name', 'role', 'scope', 'capability', 'createdAt'],
    };

    const permission = await models.Permission.findOne(options);

    if (!permission) {
      throw boom.notFound('Permission not found');
    }

    return permission;
  }

  async find({ role, capability, scope, limit = 10, offset = 0 }) {
    const where = {
      ...(role && {
        role: {
          [Op.like]: `%${role}%`,
        },
      }),
      ...(capability && {
        capability: {
          [Op.like]: `%${capability}%`,
        },
      }),
      ...(scope && {
        scope: {
          [Op.like]: `%${scope}%`,
        },
      })
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      attributes: ['id', 'name', 'capability', 'scope', 'role', 'createdAt'],
    };

    const permissions = await models.Permission.findAll(options);

    return permissions;
  }
  async update({ id, data }) {
    const permission = await this.findOne({ id });
    const updatedPermission = await permission.update(data);
    return updatedPermission;
  }
  async delete({ id }) {
    const permission = await this.findOne({ id });
    await permission.destroy();
    return { id };
  }
}

module.exports = PermissionServices;