const { User, UserSchema } = require("./user.model");
const { Attempt, AttemptSchema } = require("./user.model/attempt.model");
const { Costumer, CostumerSchema } = require("./user.model/costumer.model")

function setupModels(sequelize) {

  // INICIALIZA MODELOS
  Costumer.init(CostumerSchema, Costumer.config(sequelize));
  User.init(UserSchema, User.config(sequelize));
  Attempt.init(AttemptSchema, Attempt.config(sequelize));

  // INICIALIZA ASSOCIACIONES

  Costumer.associate(sequelize.models);
  User.associate(sequelize.models);
  Attempt.associate(sequelize.models)

}

module.exports = setupModels