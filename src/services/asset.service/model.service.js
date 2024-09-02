const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, literal } = require('sequelize');
const { modelModel } = require('../../models');

class ModelServices {
  constructor() {}

  async create(data) {
    const newModel = await models.Model.create(data, {
      include: modelModel().include,
      attributes: modelModel().attributes,
    });
    return await this.findOne(newModel.id);
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
    paranoid,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    console.log(paranoid === 'true');
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
      paranoid: paranoid == undefined ? true : paranoid === 'true',
      include: modelModel().include,
      order: [[sort, order]],
      attributes: [
        ...modelModel().attributes,
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

  async findOne(id, paranoid = true) {
    const model = await models.Model.findByPk(id, {
      paranoid,
      include: modelModel().include,
      attributes: [
        ...modelModel().attributes,
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
    return await this.findOne(id);
  }

  async restore(id) {
    const model = await this.findOne(id, false);
    const rta = await model.restore();
    return rta;
  }

  async delete({ id }) {
    const model = await this.findOne(id);
    const rta = await model.destroy();
    return rta;
  }
}

module.exports = ModelServices;
