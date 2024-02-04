const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

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

  async finOne({ id }) {
    const warehouse = await models.WarehouseProducts.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
      ],
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
        locationId
      })
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

  async update({ changes, id }) {
    const warehouse = await this.finOne({ id });
    const rta = await warehouse.update(changes);

    return rta;
  }
  async delete({ id }) {
    const warehouse = await this.finOne({ id });
    const rta = await warehouse.destroy();

    return rta;
  }
}

module.exports = WarehouseService;
