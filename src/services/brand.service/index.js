const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');

const { Op, fn, col, literal } = require('sequelize');

class BrandsServices {
  constructor() {}

  async create(data) {
    const newBrand = await models.Brand.create(data);
    return newBrand;
  }

  async find({
    id,
    name,
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
          attributes: ['id','username'],
        },
        {
          model: models.Model,
          as: 'models',
          attributes: [],
          include: [
            {
              as: 'assets',
              model: models.Asset,
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        'id',
        'name',
        [fn('COUNT', 'assets'), 'assetCount'],
        'createdAt',
      ],
      order: [[sort, order]],
      group: ['Brand.id', 'Brand.name'],
    };
    const { count, rows } = await models.Brand.findAndCountAll(options);
    const total = await models.Brand.count({ where });
    for (const row of rows) {
      const t = count.find((c) => c.id === row.id);
      row.dataValues.assetCount = t.count;
    }

    return { total, rows };
  }

  async findOne(id) {
    const brand = await models.Brand.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username']
        },
      ],
      attributes: {
        exclude: ['createdById'],
      },
    });
    if (!brand) {
      throw boom.notFound('Brand not found');
    }
    return brand;
  }

  async update({ id, changes }) {
    const brand = await this.findOne(id);

    const rta = await brand.update(changes);
    return rta;
  }

  async delete({ id }) {
    const brand = await this.findOne(id);
    const rta = await brand.destroy();
    return rta;
  }
}

module.exports = BrandsServices;
