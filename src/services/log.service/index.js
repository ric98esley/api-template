const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');
const { createdByModel, assetModel } = require('../../models');

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
      createdByModel()
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
      include.push(assetModel());
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
