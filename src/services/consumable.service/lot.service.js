const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class LotService {
  constructor() {}

  async create({ customer, type, description, createdById, movements = [] }) {
    const lot = await models.Lot.create(
      {
        customer,
        type,
        description,
        createdById,
        movements,
      },
      {
        include: ['movements'],
      }
    );
    return lot;
  }
  async find({ customer, type, description }) {
    const where = {
      ...(customer && {
        customer: {
          [Op.like]: `%${customer}%`,
        },
      }),
      ...(type && {
        type
      }),
      ...(description && {
        description: {
          [Op.like]: `%${description}%`
        }
      })
    };
    const include = [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'username'],
      },
    ];
    const { rows, count } = await models.Lot.findAndCountAll({
      where,
      include
    });

    return {
      total: count,
      rows,
    };
  }
  async findOne({
    id
  }){
    const lot = await models.Lot.findOne({
      where: {
        id
      },
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.ProductHistory,
          as: 'movements',
        }
      ]
    })

    return lot
  }
}

module.exports = LotService;
