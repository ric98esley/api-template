const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, Sequelize, fn, literal } = require('sequelize');

class CategoryServices {
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

    const newCategory = await models.Category.create(toCreate);

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
    const options = {
      ...(limit && {
        limit: Number(limit),
      }),
      ...(offset && {
        offset: Number(offset),
      }),
      where,
      include: [
        {
          model: models.HardwareSpec,
          as: 'customFields',
          required: false,
          through: {
            attributes: [],
          },
          attributes: ['id', 'name', 'createdAt'],
        },
      ],
      order: [[sort, order]],
      attributes: [
        'id',
        'name',
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
        'description',
        'type',
        'createdAt',
      ],
    };

    const rows = await models.Category.findAll(options);

    const total = await models.Category.count({ where });

    return {
      total,
      rows,
    };
  }

  async findOne(id) {
    const category = await models.Category.findByPk(id, {
      include: [
        {
          model: models.HardwareSpec,
          as: 'customFields',
          through: {
            attributes: [],
          },
        },
      ],
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
    const { name, customFields, removeFields, type, description } = data;

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

    if (customFields) {
      const fields = customFields.map((field) => {
        return {
          ...field,
          categoryId: id,
        };
      });
      await this.createFields({
        customFields: fields,
      });
    }

    if (removeFields) {
      const fields = removeFields.map(async (field) => {
        return await this.removeFields({
          categoryId: id,
          typeId: field.typeId,
        });
      });
    }

    const category = await this.findOne(id);

    const rta = await category.update(toChange);

    return rta;
  }

  async delete(id) {
    const category = await this.findOne(id);
    const rta = await category.destroy();
    return rta;
  }

  async createFields({ customFields }) {
    const specification = await models.CategorySpec.bulkCreate(customFields, {
      ignoreDuplicates: true,
    });

    return specification;
  }

  async removeFields({ categoryId, typeId }) {
    const specification = await models.CategorySpec.destroy({
      where: {
        categoryId,
        typeId,
      },
    });

    return specification;
  }
}

module.exports = CategoryServices;
