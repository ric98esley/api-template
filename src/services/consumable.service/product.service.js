const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const { productModel } = require('../../models');

class ProductService {
  constructor() {}
  async create({
    name,
    code,
    price,
    min,
    unit,
    description,
    categoryId,
    createdById,
  }) {
    const newProduct = await models.Product.create({
      name,
      code,
      price,
      min,
      unit,
      description,
      categoryId,
      createdById,
    });
    return await this.findOne({ id: newProduct.id });
  }

  async findOne({ id }) {
    const product = await models.Product.findByPk(id, {
      include: productModel().include,
      attributes: productModel().attributes,
    });
    return product;
  }
  async find({
    id,
    search,
    code,
    name,
    price,
    unit,
    description,
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
      ...(code && {
        code: {
          [Op.like]: `%${code}%`,
        },
      }),
      ...(price && {
        price: {
          [Op.like]: `%${price}%`,
        },
      }),
      ...(unit && {
        unit: {
          [Op.like]: `%${unit}%`,
        },
      }),
      ...(search && {
        [Op.or]: [
          {
            description: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            code: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(description && {
        description: {
          [Op.like]: `%${description}%`,
        },
      }),
      ...(name && {
        name: {
          [Op.like]: `%${name}%`,
        },
      }),
      ...(category && {
        [Op.or]: [
          {
            '$category.name$': {
              [Op.like]: `%${category}%`,
            },
          },
          {
            '$category.description$': {
              [Op.like]: `%${category}%`,
            },
          },
        ],
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: productModel().include,
      attributes: productModel().attributes,
      order: [[sort, order]],
    };

    const { rows, count } = await models.Product.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }
  async update({ changes, id }) {
    const product = await this.findOne({ id });
    await product.update(changes);

    return this.findOne({ id });
  }
  async delete({ id }) {
    const product = await this.findOne({ id });
    const rta = await product.destroy();

    return rta;
  }
}

module.exports = ProductService;
