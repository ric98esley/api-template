const boom = require('@hapi/boom');

const { models } = require('../../libs/sequelize');

class WarehouseServices {
  constructor() {}

  async create(data) {
    const newWarehouse = await models.Warehouse.create(data);
    return newWarehouse;
  }

  async find({ groupId }) {
    const where = {
      ...(groupId && {
        groupId
      })
    };
    const { rows, count } = await models.Warehouse.findAndCountAll({
      where,
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name'],
        },
      ],
      attributes: {
        exclude: ['createdById'],
      },
    });
    return { total: count, rows };
  }

  async findOne(id) {
    const deposit = await models.Warehouse.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'name', 'lastName', 'username'],
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name'],
        },
      ],
      attributes: {
        exclude: ['createdById'],
      },
    });
    if (!deposit) {
      throw boom.notFound('Warehouse not found');
    }
    return deposit;
  }

  async update(id, changes) {
    const deposit = await this.findOne(id);

    const rta = await deposit.update(changes);
    return rta;
  }

  async delete(id) {
    const deposit = await this.findOne(id);
    const rta = await deposit.destroy();
    return rta;
  }
}

module.exports = WarehouseServices;
