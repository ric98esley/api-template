const boom = require("@hapi/boom");

const { models } = require("../../libs/sequelize");
const { Op } = require("sequelize");

class ZonesServices {
  constructor() {}

  async create(data) {
    const newZone = await models.Zone.create(data);
    return newZone;
  }

  async find({
    name
  }) {

    const options = {
      where:  {
        ...(name && {
          name: {
            [Op.like]: `%${name}%`
          }
        })
      },
      attributes: ['name', 'id']
    }
    const {count , rows} = await models.Zone.findAndCountAll(options);
    return {
      total: count,
      rows
    };
  }

  async findOne(id) {
    const zone = await models.Zone.findByPk(id,{
      attributes: [
        'id', 'name', 'createdAt'
      ]
    });

    if (!zone) {
      throw boom.notFound("Zone not found");
    }
    return zone;
  }

  async update(id, changes) {
    const zone = await this.findOne(id);

    const rta = await zone.update(changes);
    return rta;
  }

  async delete(id) {
    const zone = await this.findOne(id);
    const rta = await zone.destroy();
    return rta;
  }
}

module.exports = ZonesServices;
