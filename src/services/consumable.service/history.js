const { models } = require('../../libs/sequelize');

const { Op } = require('sequelize');
const { productHistoryModel } = require('../../models');

class ProductHistoryService {
  async find({
    locationId,
    search,
    limit = 10,
    offset = 0,
    sort = 'target,product,code',
    order = 'DESC',
  }) {
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

    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: productHistoryModel().include,
      order: [
        ['createdAt', 'DESC'],
        [...sort.split(','), order],
      ],
      attributes: productHistoryModel().attributes,
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
