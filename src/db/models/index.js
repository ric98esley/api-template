const bcryptjs = require('bcryptjs');


const { User, UserSchema } = require("./user.model");
const { Customer, CustomerSchema } = require("./user.model/customer.model");
const { Log, LogSchema } = require('./log.model');

function setupModels(sequelize) {

  // INICIALIZA MODELOS
  Customer.init(CustomerSchema, Customer.config(sequelize));
  User.init(UserSchema, User.config(sequelize));
  Log.init(LogSchema, Log.config(sequelize));

  // INICIALIZA ASSOCIACIONES

  Customer.associate(sequelize.models);
  User.associate(sequelize.models);
  Log.associate(sequelize.models);

  // HOOKS

  User.addHook('beforeUpdate', async (options) => {
    try {
      if (options && options.dataValues) {
        if (options.dataValues.password) {
          const hash = await bcryptjs.hash(
            options.dataValues.password,
            10
          );
          options.dataValues.password = hash
        }
      }
    } catch (error) {}
  });

  User.addHook('beforeCreate', async (options) => {
    try {
      if (options && options.dataValues) {
        if (options.dataValues.password) {
          const hash = await bcryptjs.hash(
            options.dataValues.password,
            10
          );
          options.dataValues.password = hash
        }
      }
    } catch (error) {}
  });
}

module.exports = setupModels