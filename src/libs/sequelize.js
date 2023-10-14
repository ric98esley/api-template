const { Sequelize } = require("sequelize");
let colors = require('colors');


// S E T U P

const { config } = require("./../config");
const setupModels = require("./../db/models");

// U R I 

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `${config.dialect}://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
console.log(URI)

const sequelize = new Sequelize(URI, {
  dialect: `${config.dialect}`,
  logging: console.log,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("\n");
    console.log("********************************************************".green);
    console.log("✔ Conexión a la base de datos establecida correctamente!".green);
    console.log("********************************************************".green);
    console.log("\n");
  })
  .catch((error) => {
    console.log(  "**************************************".red);
    console.error("No se pudo conectar a la base de datos:".red);
    console.log(  "**************************************".red);
    console.log(colors.red(error));
  });

setupModels(sequelize);

module.exports = sequelize;
