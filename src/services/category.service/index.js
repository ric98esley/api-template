const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');
const { Op, Sequelize } = require('sequelize');

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
          through: {
            attributes: [],
          },
          attributes: ['id', 'name', 'createdAt'],
        },
        {
          model: models.Brand,
          as: 'brands',
          include: {
            model: models.Model,
            as: 'models',
          },
          through: {
            attributes: [],
          },
        },
      ],
      distinct: true,
      order: [[sort, order]],
      attributes: ['id', 'name', 'description', 'createdAt'],
    };

    const { rows, count } = await models.Category.findAndCountAll(options);

    const rowsCopy = JSON.parse(JSON.stringify(rows));

    const filteredRows = rowsCopy.map((row) => {
      const brands = row.brands.map((brand) => {
        const models = brand.models.filter(
          (model) => model.categoryId === row.id
        );
        return { ...brand, models };
      });
      return { ...row, brands };
    });

    return {
      total: count,
      rows: filteredRows,
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
    const specification = await models.CategorySpecification.destroy({
      where: {
        categoryId,
        typeId,
      },
    });

    return specification;
  }
}

module.exports = CategoryServices;
