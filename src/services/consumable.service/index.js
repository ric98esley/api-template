const boom = require('@hapi/boom');
const { models } = require('../../libs/sequelize');
const math = require('mathjs');

const { Op } = require('sequelize');
const { locationProductsModel } = require('../../models');

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
    return this.findOne({ id: newProductsOnWarehouse.id, locationId });
  }

  async findOne({ id, locationId }) {
    const where = {
      id: Number(id),
      locationId,
    };

    const warehouse = await models.LocationProducts.findOne({
      where,
      include: locationProductsModel().include,
      attributes: locationProductsModel().attributes,
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
      ...(search && {
        [Op.or]: [
          {
            '$product.name$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$product.code$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(category && {
        '$product.category.name$': {
          [Op.like]: `%${category}%`,
        },
      }),
      ...(location && {
        '$location.name$': {
          [Op.iLike]: `%${location}%`,
        },
      }),
      ...(groupId && {
        '$location.group_id$': groupId,
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where,
      include: locationProductsModel().include,
      order: [[sort, order]],
      attributes: locationProductsModel().attributes,
    };

    const { rows, count } = await models.LocationProducts.findAndCountAll(
      options
    );
    return {
      total: count,
      rows,
    };
  }

  async update({ changes, id, locationId }) {
    const warehouse = await this.findOne({ id, locationId });
    await warehouse.update(changes);

    return this.findOne({ id, locationId });
  }

  async add({ locationId, createdById, min = 1, productId, quantity }) {
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
