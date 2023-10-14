
const { config } = require("./../config");

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `${config.dialect}://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;

console.log(URI)

module.exports = {
    development: {
        url: URI,
        dialect: `${config.dialect}`
    },
    production: {
        url: URI,
        dialect: `${config.dialect}`
    },

}