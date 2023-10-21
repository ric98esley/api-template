const bcryptjs = require('bcryptjs');


const { User, UserSchema } = require("./user.model");
const { Attempt, AttemptSchema } = require("./user.model/attempt.model");
const { Customer, CustomerSchema } = require("./user.model/customer.model")

function setupModels(sequelize) {

  // INICIALIZA MODELOS
  Customer.init(CustomerSchema, Customer.config(sequelize));
  User.init(UserSchema, User.config(sequelize));
  Attempt.init(AttemptSchema, Attempt.config(sequelize));

  // INICIALIZA ASSOCIACIONES

  Customer.associate(sequelize.models);
  User.associate(sequelize.models);
  Attempt.associate(sequelize.models)


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