const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');

class LogService {
  async create({ type, table, targetId, details, ip, createdById }) {
    if (!details.message) {
      const message = details;
      details = {
        message,
      };
    }

    const attempt = await models.Log.create({
      type,
      table,
      targetId,
      details: JSON.stringify(details),
      ip,
      createdById,
    });
    return attempt;
  }
  async find({ table, type, targetId }) {
    const include = [
      {
        model: models.User,
        as: 'createdBy',
        attributes: ['id', 'username'],
      },
    ];

    const where = {
      table,
      ...(type && {
        type: {
          [Op.like]: `%${type}$`,
        },
      }),
      targetId
    };

    if (table == 'asset') {
      include.push({
        model: models.Asset,
        as: 'asset',
      });
    }

    const { rows, count } = await models.Log.findAndCountAll({
      include,
      where,
      attributes: [
        'id',
        'table',
        'details',
        'ip',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      total: count,
      rows
    };
  }
}

module.exports = LogService;
