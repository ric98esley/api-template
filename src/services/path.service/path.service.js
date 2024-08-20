const { Op } = require('sequelize');
const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');

class PathService {
  async find(data) {
    const { limit, offset, search } = data;
    const options = {
      attributes: ['id', 'path', 'name', 'isAllow', 'createdAt'],
      order: [['createdAt', 'DESC']],
      where: {},
    };

    if (limit) {
      options.limit = Number(limit);
    }
    if (offset) {
      options.offset = Number(offset);
    }

    if (search) {
      options.where = {
        [Op.or]: [
          {
            path: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      };
    }
    const { rows, count } = await models.PathRecord.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }
  async create(data) {
    const { path, name, isAllow } = data;
    const pathRecord = await models.PathRecord.create({
      path,
      name,
      isAllow,
    });
    return pathRecord;
  }

  async findOne(id) {
    const pathRecord = await models.PathRecord.findByPk(id);
    if (!pathRecord) {
      throw boom.notFound('Path not found');
    }
    return pathRecord;
  }
  async update(id, data) {
    const pathRecord = await this.findOne(id);
    await pathRecord.update(data);
    return pathRecord;
  }

  async delete(id) {
    const pathRecord = await this.findOne(id);
    await pathRecord.destroy();
    return pathRecord;
  }
}

module.exports = PathService;
