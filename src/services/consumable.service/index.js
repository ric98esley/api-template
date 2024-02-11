const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const math = require('mathjs');

const { Op, where } = require('sequelize');

class WarehouseService {
  constructor() {}
  async create({ productId, quantity, locationId, min, createdById, product }) {
    const newProductsOnWarehouse = await models.LocationProducts.create(
      {
        ...(productId && {
          productId,
        }),
        quantity,
        min,
        locationId,
        createdById,
        ...(!productId &&
          product && {
            product: {
              ...product,
              createdById,
            },
          }),
      },
      { include: ['product'] }
    );
    return newProductsOnWarehouse;
  }

  async findOne({ id, locationId }) {
    const where = {
      id: Number(id),
      locationId,
    };

    const include = [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'username'],
      },
      {
        model: models.Product,
        as: 'product',
        include: [
          {
            model: models.Category,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        attributes: [
          'id',
          'code',
          'name',
          'price',
          'unit',
          'description',
          'createdAt',
        ],
      },
      {
        model: models.Location,
        as: 'location',
        attributes: ['id', 'code', 'name']
      }
    ];
    const warehouse = await models.LocationProducts.findOne({
      where,
      include,
    });
    return warehouse;
  }
  async find({
    id,
    search,
    location,
    locationId,
    groupId,
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
      ...(locationId && {
        locationId,
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
          attributes: ['id', 'username', 'email'],
        },
        {
          model: models.Product,
          as: 'product',
          include: [
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
          where: {
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
          },
          attributes: [
            'id',
            'code',
            'name',
            'price',
            'unit',
            'description',
            'createdAt',
          ],
        },
        {
          model: models.Location,
          as: 'location',
          where: {
            ...(groupId && {
              groupId: groupId,
            }),
            ...(location && {
              [Op.or]: [
                {
                  name: {
                    [Op.like]: `%${location}%`,
                  },
                },
                {
                  code: {
                    [Op.like]: `%${location}`,
                  },
                },
              ],
            }),
          },
          attributes: ['id', 'name'],
        },
      ],
      order: [[sort, order]],
      attributes: ['id', 'quantity', 'min', 'createdAt'],
    };

    const { rows, count } = await models.LocationProducts.findAndCountAll(
      options
    );
    return {
      total: count,
      rows,
    };
  }

  async update({ changes, id , locationId}) {
    const warehouse = await this.findOne({ id, locationId});
    const rta = await warehouse.update(changes);

    return rta;
  }

  async add({ locationId, createdById, min = 1, productId, quantity }) {
    const product = await models.Product.findByPk(productId);
    const location = await models.Location.findByPk(locationId);

    if (!location) {
      throw boom.notFound('Deposito no encontrado');
    }

    if (!product)
      return {
        error: true,
      };

    const [stock, created] = await models.LocationProducts.findOrCreate({
      where: {
        locationId,
        productId,
      },
      defaults: {
        quantity,
        createdById,
        min,
      },
    });

    if (!created) {
      const newQuantity = math.evaluate(`${stock.quantity} + ${quantity}`);
      stock.update({
        quantity: newQuantity,
      });
    }

    return stock;
  }
  async sub({ locationId, createdById, min = 1, productId, quantity }) {
    const product = await models.Product.findByPk(productId);
    const location = await models.Location.findByPk(locationId);

    if (!location) {
      throw boom.notFound('Deposito no encontrado');
    }

    if (!product)
      return {
        error: true,
      };

    const [stock, created] = await models.LocationProducts.findOrCreate({
      where: {
        locationId,
        productId,
      },
      defaults: {
        quantity,
        createdById,
        min,
      },
    });

    if (!created) {
      const newQuantity = math.evaluate(`${stock.quantity} - ${quantity}`);

      if (Number(newQuantity) < 0) {
        return {
          error: true,
        };
      }

      stock.update({
        quantity: newQuantity,
      });
    }

    return stock;
  }
  async delete({ id }) {
    const warehouse = await this.finOne({ id });
    const rta = await warehouse.destroy();

    return rta;
  }
}

module.exports = WarehouseService;
