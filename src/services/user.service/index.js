const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');

class UsersServices {
  constructor() {}

  async create(data) {
    const newUser = await models.User.create(data, {
      include: ['profile'],
    });
    delete newUser.dataValues.password;
    return newUser;
  }

  async findOne({ id }) {
    const options = {
      include: [
        {
          as: 'profile',
          model: models.Customer,
          attributes: ['id', 'name', 'lastName'],
        },
      ],
      where: {
        id,
      },
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
    };
    const user = await models.User.findOne(options);
    if (!user) {
      throw boom.notFound('User not found');
    }
    return user;
  }
  async findOneUsername(username) {
    // Only for login
    const user = await models.User.findOne({
      where: {
        username: username,
      },
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
      ],
      attributes: {
        exclude: ['createdById', 'managerId', 'locationId'],
      },
    });
    return user;
  }
  async find({
    sort = 'createdAt',
    order = 'DESC',
    search,
    groupId,
    username,
    name,
    lastName,
    role,
    email,
    isActive,
    all,
    cardId,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
  }) {
    let where = {
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
      ...(search && {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            lastName: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            cardId: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(lastName && {
        lastName: {
          [Op.like]: `%${lastName}`,
        },
      }),
      ...(email && {
        email: {
          [Op.like]: `%${email}%`,
        },
      }),
      ...(!all &&
        isActive && {
          isActive: {
            [Op.eq]: isActive,
          },
        }),
      ...(groupId && {
        groupId,
      }),
      ...(cardId && {
        cardId: {
          [Op.like]: `%${cardId}%`,
        },
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        }),
      [Op.not]: [{ role: 'superuser' }],
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'name', 'lastName'],
        },
        {
          model: models.User,
          as: 'manager',
          attributes: ['id', 'name', 'lastName'],
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name', 'code'],
        },
        {
          model: models.Auth,
          as: 'profile',
          ...(role ||
            (username && {
              where: {
                ...(role && {
                  role: {
                    [Op.like]: `%${role}%`,
                  },
                }),
                ...(username && {
                  username: {
                    [Op.like]: `%${username}%`,
                  },
                }),
              },
            })),
          attributes: ['role'],
        },
      ],
      order: [[sort, order]],
      attributes: ['id', 'email', 'name', 'lastName', 'phone', 'cardId'],
    };
    const { count, rows } = await models.User.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }

  async update({ id, changes }) {
    const user = await this.findOne({ id });
    const rta = await user.update(changes);
    return rta;
  }

  async delete(id) {
    const user = await this.findOne({ id });
    const rta = await user.update({
      isActive: false,
    });
    return rta;
  }
}

module.exports = UsersServices;
