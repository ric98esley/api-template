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
    type,
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
      ...(type && {
        type: {
          [Op.like]: `%${type}%`,
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
      ],
      attributes: [
        'id',
        'name',
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                left join models on assets.model_id = models.id
                  where
                    brand_id = Brand.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
        'createdAt',
      ],
      order: [[sort, order]],
    };
    const { count, rows } = await models.Brand.findAndCountAll(options);

    return { total: count, rows };
  }

  async findOne(id) {
    const brand = await models.Brand.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
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
