const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

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
    return newProduct;
  }

  async findOne({ id }) {
    const product = await models.Product.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Category,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
      ],
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
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: [
        // createdBy
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id',  'username', 'email'],
        },
        {
          model: models.Category,
          as: 'category',
          where: {
            ...(category && {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${category}%`,
                  },
                },
                {
                  description: {
                    [Op.like]: `%${category}%`,
                  },
                },
              ],
            }),
          },
          attributes: ['id', 'name', 'description'],
        },
      ],
      order: [[sort, order]],
      attributes: [
        'id',
        'name',
        'code',
        'price',
        'unit',
        'description',
        'createdAt',
      ],
    };

    const { rows, count } = await models.Product.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }
  async update({ changes, id }) {
    const product = await this.findOne({ id });
    const rta = await product.update(changes);

    return rta;
  }
  async delete({ id }) {
    const product = await this.findOne({ id });
    const rta = await product.destroy();

    return rta;
  }
}

module.exports = ProductService;
