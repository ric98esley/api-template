const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const { locationTypeModel } = require('../../models');

class TypesServices {
  constructor() {}

  async create(data) {
    const newType = await models.LocationType.create(data);
    return await this.findOne(newType.id);
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
      attributes: locationTypeModel().attributes,
      include: locationTypeModel().include,
    });
    return {
      total: count,
      rows,
    };
  }

  async findOne(id) {
    const type = await models.LocationType.findByPk(id, {
      attributes: locationTypeModel().attributes,
      include: locationTypeModel().include,
    });
    if (!type) {
      throw boom.notFound('location type not found');
    }
    return type;
  }

  async update(id, changes) {
    const type = await this.findOne(id);

    await type.update(changes);
    return this.findOne(type.id);
  }

  async delete(id) {
    const type = await this.findOne(id);
    const rta = await type.destroy();
    return rta;
  }
}

module.exports = TypesServices;
