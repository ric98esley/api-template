const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, Sequelize, fn, literal } = require('sequelize');

class CategoryClassServices {
  constructor() {}

  userId(user) {
    return user.sub;
  }

  async create({ data, user }) {
    const { name, customFields, type, description } = data;

    const toCreate = {
      name,
      type,
      description,
      createdById: this.userId(user),
    };

    const newCategory = await models.CategoryClass.create(toCreate);

    if (customFields) {
      const newFields = customFields.map((field) => {
        return {
          ...field,
          categoryId: newCategory.id,
        };
      });
      await this.createFields({
        customFields: newFields,
      });
    }

    return newCategory;
  }

  async createMany(items) {
    const newCategories = await models.CategoryClass.bulkCreate(items, {
      fields: ['id', 'name', 'createdById'],
      updateOnDuplicate: ['id'],
    });
    return newCategories;
  }

  async find({
    id,
    search,
    name,
    description,
    limit,
    offset,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    const where = {
      ...(id && {
        id,
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
    const options = {
      ...(limit && {
        limit: Number(limit),
      }),
      ...(offset && {
        offset: Number(offset),
      }),
      where,
      order: [[sort, order]],
      attributes: [
        'id',
        'name',
        [
          literal(
            `(SELECT count(*)
              FROM assets as assets
                left join models on assets.model_id = models.id
                left join categories on models.category_id = categories.id
                  where
                    categories.class_id = CategoryClass.id and
                    assets.deleted_at is null)`
          ),
          'count',
        ],
        'description',
        'createdAt',
      ],
    };

    const rows = await models.CategoryClass.findAll(options);

    const total = await models.CategoryClass.count({ where });

    return {
      total,
      rows,
    };
  }

  async findOne(id) {
    const category = await models.CategoryClass.findByPk(id, {
      attributes: {
        exclude: ['createdById'],
      },
    });
    if (!category) {
      throw boom.notFound('Category not found');
    }
    return category;
  }

  async update({ id, data }) {
    const { name, description } = data;

    const toChange = {
      ...(name && {
        name,
      }),
      ...(description && {
        description,
      }),
    };

    const category = await this.findOne(id);

    const rta = await category.update(toChange);

    return rta;
  }

  async delete(id) {
    const category = await this.findOne(id);
    const rta = await category.destroy();
    return rta;
  }

}

module.exports = CategoryClassServices;
