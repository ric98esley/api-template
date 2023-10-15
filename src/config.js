require("dotenv").config();

/**
 * @description variables of database server
 */

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  jwtSecret: process.env.JWT_SECRET,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpPass: process.env.SMTP_PASS,
  dialect: process.env.DIALECT || 'mysql'
};

module.exports = { config };
