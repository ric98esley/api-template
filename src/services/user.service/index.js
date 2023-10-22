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
    profile,
    username,
    role,
    isActive,
    all,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
  }) {
    let where = {
      ...(role && {
        role: {
          [Op.like]: `%${role}%`,
        },
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
      [Op.not]: [{ role: 'superuser' }],
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          model: models.Customer,
          as: 'profile',
          attributes: ['id', 'name', 'lastName', 'phone', 'cardId'],
          ...(profile && {
            where: {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${profile}%`,
                  },
                },
                {
                  lastName: {
                    [Op.like]: `%${profile}%`,
                  },
                },
                {
                  cardId: {
                    [Op.like]: `%${profile}%`,
                  },
                },
                {
                  phone: {
                    [Op.like]: `%${profile}%`,
                  },
                },
              ],
            },
          }),
        },
      ],
      order: [[sort, order]],
      attributes: [
        'id',
        'email',
        'username',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
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
