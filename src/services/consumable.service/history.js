const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const math = require('mathjs');

const { Op, where } = require('sequelize');

class ProductHistoryService {
  async find({ locationId, search, limit = 10, offset = 0, sort = 'target,product,code', order = 'DESC'}) {
    const where = {
      ...(locationId && {
        '$lot.location.id$': locationId,
      }),
      ...(search && {
        [Op.or]: [
          {
            '$target.product.name$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$target.product.code$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
    };

    const include = [
      {
        model: models.LocationProducts,
        as: 'target',
        attributes: ['id', 'createdAt'],
        include: [
          {
            model: models.Product,
            as: 'product',
            attributes: ['id', 'code', 'name', 'unit'],
            paranoid: false,
            include: [
              {
                model: models.Category,
                as: 'category',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      },
      {
        model: models.Lot,
        as: 'lot',
        attributes: ['id', 'customer', 'type', 'description', 'createdAt'],
        include: [
          {
            model: models.Location,
            as: 'location',
            attributes: ['id', 'code', 'name'],
          },
        ],
      },
    ];

    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include,
      order: [
        ['createdAt', 'DESC'],
        [...sort.split(','), order],
      ],
    };
    const { count, rows } = await models.ProductHistory.findAndCountAll(
      options
    );

    return {
      total: count,
      rows,
    };
  }
}

module.exports = ProductHistoryService;
