const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, literal } = require('sequelize');
const { modelModel } = require('../../models');

class ModelServices {
  constructor() {}

  async create(data) {
    const newModel = await models.Model.create(data);
    const model = this.findOne(newModel.id);
    return model;
  }

  async createMany(items) {
    const newModels = await models.Model.bulkCreate(items, {
      fields: [
        'id',
        'name',
        'unit',
        'min',
        'categoryId',
        'brandId',
        'createdById',
      ],
      updateOnDuplicate: ['id', 'name', 'unit', 'min', 'categoryId', 'brandId'],
    });
    return newModels;
  }

  async find({
    name,
    brand,
    category,
    categoryId,
    brandId,
    limit,
    offset,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(categoryId && {
        categoryId: Number(categoryId),
      }),
      ...(brandId && {
        brandId: Number(brandId),
      }),
      ...(category && {
        '$category.name$': {
          [Op.like]: `%${category}%`,
        },
      }),
      ...(brand && {
        '$brand.name$': {
          [Op.like]: `%${brand}%`,
        },
      }),
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
    };
    const options = {
      ...(limit && {
        limit: Number(limit),
      }),
      ...(offset && {
        offset: Number(offset),
      }),
      where,
      include: modelModel.include,
      order: [[sort, order]],
      attributes: [
        ...modelModel.attributes,
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                  where
                    model_id = Model.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
      ],
    };

    const { count, rows } = await models.Model.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }

  async findOne(id) {
    const model = await models.Model.findByPk(id, {
      include: modelModel.include,
      attributes: [
        ...modelModel.attributes,
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                  where
                    model_id = Model.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
      ],
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
