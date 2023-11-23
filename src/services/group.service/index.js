const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

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

  async findOne({ id }) {
    const group = await models.Group.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        // manager
        {
          model: models.User,
          as: 'manager',
          attributes: ['id', 'username', 'email'],
          include: [
            {
              model: models.Customer,
              as: 'profile',
            },
          ],
        },
        // createdBy
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        // parent
        {
          model: models.Group,
          as: 'parent',
          attributes: [
            'id',
            'code',
            'name',
            'enabled',
            'createdAt',
            'updatedAt',
          ],
        },
      ],
      attributes: ['id', 'code', 'name', 'enabled', 'createdAt', 'updatedAt'],
    });

    if (!group) boom.notFound('Group not found');
    return group;
  }
  async find({
    id,
    code,
    name,
    managerId,
    parent,
    manager,
    groupId,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(id && {
        id,
      }),
      ...(groupId && {
        id: groupId,
      }),
      ...(!id &&
        managerId && {
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
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        // manager
        {
          model: models.User,
          as: 'manager',
          ...(!manager && {
            required: false,
          }),
          where: {
            ...(manager && {
              [Op.or]: [
                {
                  username: {
                    [Op.like]: `%${manager}%`,
                  },
                },
                {
                  email: {
                    [Op.like]: `%${manager}%`,
                  },
                },
              ],
            }),
          },
          attributes: ['id', 'username'],
          include: [
            {
              model: models.Customer,
              as: 'profile',
              attributes: ['id', 'name', 'lastName', 'phone', 'cardId', 'createdAt']
            }
          ]
        },
        // createdBy
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        // parent
        {
          model: models.Group,
          as: 'parent',
          ...(parent && {
            where: {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${parent}%`,
                  },
                },
                {
                  code: {
                    [Op.like]: `%${parent}%`,
                  },
                },
              ],
            },
          }),
          attributes: ['id', 'code', 'name'],
        },
      ],
      attributes: ['id', 'code', 'name', 'enabled', 'createdAt'],
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
