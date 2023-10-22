const { models } = require('../../libs/sequelize');


class LogService {
  async create({ type, table, targetId, details, ip, createdById }) {
    const attempt = await models.Log.create({
      type,
      table,
      targetId,
      details,
      ip,
      createdById,
    });
    return attempt;
  }
}

module.exports = LogService;
