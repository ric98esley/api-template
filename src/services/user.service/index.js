const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');
const { userModel } = require('../../models');

class UsersServices {
  constructor() {}

  async create(data) {
    const newUser = await models.User.create(data, {
      include: ['profile'],
    });
    delete newUser.dataValues.password;

    return newUser;
  }

  async findOne({ id, email, username, groupId }) {
    const options = {
      include: userModel.include,
      where: {
        ...(id && {
          id,
        }),
        ...(email && {
          email,
        }),
        ...(username && {
          username,
        }),
        ...(groupId && {
          groupId,
        }),
      },
      attributes: userModel.attributes,
    };
    const user = await models.User.findOne(options);
    if (!user) {
      throw boom.notFound('User not found');
    }
    return user;
  }
  async find({
    sort = 'createdAt',
    order = 'DESC',
    profile,
    groupId,
    username,
    search,
    role,
    isActive,
    all,
    group,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
  }) {
    let where = {
      ...(role && {
        role: {
          [Op.or]: role.split(',').map((r) => ({
            [Op.like]: `%${r}%`,
          })),
        },
      }),
      ...(groupId && {
        groupId,
      }),
      ...(username && {
        [Op.or]: [
          {
            email: {
              [Op.like]: `%${username}%`,
            },
          },
          {
            username: {
              [Op.like]: `%${username}%`,
            },
          },
        ],
      }),
      ...(search && {
        [Op.or]: [
          {
            email: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            username: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$profile.name$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$profile.last_name$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$profile.card_id$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$profile.phone$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(!all &&
        isActive && {
          isActive: {
            [Op.eq]: isActive,
          },
        }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        }),
      ...(group && {
        '$group.name$': {
          [Op.like]: `%${group}%`,
        },
      }),
      [Op.not]: [{ role: 'superuser' }],
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: userModel.include,
      order: [[sort, order]],
      attributes: userModel.attributes,
    };
    const { count, rows } = await models.User.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }

  async update({ id, changes, groupId }) {
    const user = await this.findOne({ id, groupId });
    const rta = await user.update(changes);
    return rta;
  }

  async delete({ id, groupId }) {
    const user = await this.findOne({ id, groupId });
    const rta = await user.destroy();
    return rta;
  }
}

module.exports = UsersServices;
