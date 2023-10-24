const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');

class CustomersServices {
  constructor() {}

  async create(data) {
    const newCustomer = await models.Customer.create(data);
    delete newCustomer.dataValues.password;

    return newCustomer;
  }

  async findOne({ id, phone }) {
    const options = {
      include: [
        {
          as: 'User',
          model: models.Customer,
          attributes: ['id', 'username', 'email', 'role', 'createdAt'],
        },
      ],
      where: {
        ...(id && {
          id,
        }),
        ...(phone && {
          phone,
        }),
      },
    };
    const customer = await models.Customer.findOne(options);
    if (!customer) {
      throw boom.notFound('Customer not found');
    }
    return customer;
  }
  async find({
    sort = 'createdAt',
    order = 'DESC',
    search,
    limit = 10,
    offset = 0,
    startDate,
    endDate,
  }) {
    let where = {
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
            cardId: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            phone: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      order: [[sort, order]],
      attributes: ['id', 'name', 'lastName', 'phone', 'cardId', 'createdAt'],
    };
    const { count, rows } = await models.Customer.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }

  async update({ id, changes }) {
    const customer = await this.findOne({ id });
    const rta = await customer.update(changes);
    return rta;
  }

  async delete(id) {
    const customer = await this.findOne({ id });
    const rta = await customer.destroy();
    return rta;
  }
}

module.exports = CustomersServices;
