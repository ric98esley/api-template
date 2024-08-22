const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const { groupModel } = require('../../models');

class GroupsService {
  constructor() {}
  async create({ code, name, managerId, parentId, createdById }) {
    const newGroup = await models.Group.create({
      code,
      name,
      managerId,
      parentId,
      createdById,
    });
    return newGroup;
  }

  async createMany(groups) {
    const newGroups = await models.Group.bulkCreate(groups, {
      ignoreDuplicates: true,
    });
    return newGroups;
  }

  async findOne({ id, groupId }) {
    const group = await models.Group.findOne({
      where: {
        id,
      },
      include: [
        ...groupModel.include,
        {
          model: models.Group,
          as: 'parent',
          attributes: [...groupModel.attributes],
        },
      ],
      attributes: groupModel.attributes,
    });

    if (!group || (groupId && !groupId.includes(group.id))) {
      throw boom.notFound('Group not found');
    }
    return group;
  }
  async find({
    code,
    name,
    managerId,
    parent,
    parentId,
    manager,
    groupId,
    limit,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(groupId && {
        id: groupId,
      }),
      ...(managerId && {
        managerId,
      }),
      ...(code && {
        code: {
          [Op.like]: `%${code}%`,
        },
      }),
      ...(name && {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${name}%`,
            },
          },
          {
            code: {
              [Op.like]: `%${name}%`,
            },
          },
        ],
      }),
      ...(manager && {
        [Op.or]: [
          {
            '$manager.username$': {
              [Op.like]: `%${manager}%`,
            },
          },
          {
            '$manager.email$': {
              [Op.like]: `%${manager}%`,
            },
          },
        ],
      }),
      ...(parent === 'null' && {
        parentId: null,
      }),
      ...(parent &&
        parent !== 'null' && {
          [Op.or]: [
            {
              '$parent.name$': {
                [Op.like]: `%${parent}%`,
              },
            },
            {
              '$parent.code$': {
                [Op.like]: `%${parent}%`,
              },
            },
          ],
        }),
    };
    const options = {
      ...(limit && { limit: Number(limit) }),
      offset: Number(offset),
      where,
      include: [
        ...groupModel.include,
        {
          model: models.Group,
          as: 'parent',
          attributes: [...groupModel.attributes],
        },
      ],
      attributes: groupModel.attributes,
      order: [[sort, order]],
    };

    const { rows, count } = await models.Group.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }
  async update({ changes, id }) {
    const group = await this.findOne({ id });
    const rta = await group.update(changes);

    return rta;
  }
  async delete({ id }) {
    const group = await this.findOne({ id });
    const rta = await group.destroy();

    return rta;
  }
}

module.exports = GroupsService;
