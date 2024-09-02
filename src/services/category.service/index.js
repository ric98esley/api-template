const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, literal } = require('sequelize');
const { categoryModel } = require('../../models');
const { i } = require('mathjs');

class CategoryServices {
  constructor() {}
  async create({ data, user }) {
    const { name, customFields, type, description } = data;

    const toCreate = {
      name,
      type,
      description,
      createdById: user.sub,
    };

    const newCategory = await models.Category.create(toCreate);

    return this.findOne(newCategory.id);
  }

  async createMany(items) {
    const newCategories = await models.Category.bulkCreate(items, {
      fields: ['id', 'name', 'description', 'createdById', 'classId'],
      updateOnDuplicate: ['id'],
    });
    return newCategories;
  }

  async find({
    id,
    search,
    name,
    type,
    description,
    paranoid,
    limit,
    offset,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(id && {
        id,
      }),
      ...(type && {
        type: {
          [Op.like]: `%${type}%`,
        },
      }),
      ...(description && {
        description: {
          [Op.like]: `%${description}%`,
        },
      }),
      ...(search && {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
    };

    if (paranoid === 'false') paranoid = false;
    if (paranoid === 'true') paranoid = true;
    if (paranoid === undefined) paranoid = true;
    const options = {
      ...(limit && {
        limit: Number(limit),
      }),
      ...(offset && {
        offset: Number(offset),
      }),
      where,
      paranoid,
      include: categoryModel().include,
      order: [[sort, order]],
      attributes: [
        ...categoryModel().attributes,
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                left join models on assets.model_id = models.id
                  where
                    category_id = Category.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
      ],
    };

    const rows = await models.Category.findAll(options);

    const total = await models.Category.count({ where });

    return {
      total,
      rows,
    };
  }

  async findOne(id, paranoid = true) {
    const category = await models.Category.findByPk(id, {
      include: categoryModel().include,
      paranoid,
      attributes: [
        ...categoryModel().attributes,
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                left join models on assets.model_id = models.id
                  where
                    category_id = Category.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
      ],
    });
    if (!category) {
      throw boom.notFound('Category not found');
    }
    return category;
  }

  async update({ id, data }) {
    const { name, type, description } = data;

    const toChange = {
      ...(name && {
        name,
      }),
      ...(type && {
        type,
      }),
      ...(description && {
        description,
      }),
    };

    const category = await this.findOne(id);

    await category.update(toChange);

    return this.findOne(id);
  }

  async delete(id) {
    const category = await this.findOne(id);
    const rta = await category.destroy();
    return rta;
  }

  async restore(id) {
    const category = await this.findOne(id, false);
    const rta = await category.restore();
    return rta;
  }
}

module.exports = CategoryServices;
