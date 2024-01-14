const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class TypesServices {
  constructor() {}

  async create(data) {
    const newType = await models.LocationType.create(data);
    return newType;
  }

  async find({ name, status }) {
    const where = {
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
      ...(status && {
        status: status.split(','),
      }),
    };
    const { rows, count } = await models.LocationType.findAndCountAll({
      where,
    });
    return {
      total: count,
      rows,
    };
  }

  async findOne(id) {
    const type = await models.LocationType.findByPk(id);
    if (!type) {
      throw boom.notFound('location type not found');
    }
    return type;
  }

  async update(id, changes) {
    const type = await this.findOne(id);

    const rta = await type.update(changes);
    return rta;
  }

  async delete(id) {
    const type = await this.findOne(id);
    const rta = await type.destroy();
    return rta;
  }
}

module.exports = TypesServices;
