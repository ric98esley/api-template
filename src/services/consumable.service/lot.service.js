const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class LotService {
  constructor (){}

  async create ({
    customer,
    type,
    description,
    target,
    createdById
  }) {
    const lot = await models.Lot.create(
      {
        customer,
        type,
        description,
        createdById
      }
    );
    return lot
  }
}

module.exports = LotService