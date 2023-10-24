const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class ModelServices {
  constructor() {}

  async create(data) {
    const newModel = await models.Model.create(data);
    const model = this.findOne(newModel.id);
    return model;
  }

  async find({
    id,
    name,
    brand,
    category,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(id && {
        id,
      }),
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Category,
          as: 'category',
          attributes: ['id', 'name'],
          where: {
            ...(category && {
              name: {
                [Op.like]: `%${category}%`,
              },
            }),
          },
        },
        {
          model: models.Brand,
          as: 'brand',
          attributes: ['id', 'name'],
          where: {
            ...(brand && {
              name: {
                [Op.like]: `%${brand}%`,
              },
            }),
          },
        },
      ],
      order: [[sort, order]],
      attributes: ['id', 'name', 'unit', 'min', 'createdAt'],
    };

    const { count, rows } = await models.Model.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }

  async findOne(id) {
    const model = await models.Model.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: models.Brand,
          as: 'brand',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'name', 'unit', 'min', 'createdAt'],
    });
    if (!model) {
      throw boom.notFound('Model not found');
    }
    return model;
  }

  async update(id, changes) {
    const model = await this.findOne(id);

    const rta = await model.update(changes);
    return rta;
  }

  async delete({ id }) {
    const model = await this.findOne(id);
    const rta = await model.destroy();
    return rta;
  }
}

module.exports = ModelServices;
