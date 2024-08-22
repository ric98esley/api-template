const { models } = require('../libs/sequelize');
const createdByModel = require('./created_by.model');

const groupModel = () => ({
  model: models.Group,
  as: 'group',
  include: [
    {
      ...createdByModel(),
    },
    {
      model: models.User,
      as: 'manager',
      attributes: createdByModel().attributes,
    },
  ],
  attributes: ['id', 'code', 'name', 'enabled', 'createdAt', 'updatedAt'],
});

module.exports = groupModel;
