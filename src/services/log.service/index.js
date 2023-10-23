const { models } = require('../../libs/sequelize');

class LogService {
  /**
 * @description description of each field in the table
 * @property {{message: string, query: string} || string} details - detalles de la operación
 * @property {string} table - tabla modificada
 * @property {number} targetId - objetivo
 * @property {string} type - tipo de crud
 * @property {string} ip - ip del request
 * @property {string} createdById - Id de la persona que lo creo
 */
  async create({
    type,
    table,
    targetId,
    details,
    ip,
    createdById,
  }) {

    if(!details.message) {
      const message = details
      details = {
        message
      }
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
}

module.exports = LogService;
