require('dotenv').config();

/**
 * @description variables of database server
 */

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  dialect: process.env.DIALECT || 'mysql',
  logging: process.env.LOGGING == 'true' ? console.log : false
};

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtRecovery: process.env.JWT_RECOVERY,
  googleClienteSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleClienteId: process.env.GOOGLE_CLIENT_ID,
}

const emailConfig = {
  smtpEmail: process.env.SMTP_EMAIL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpPass: process.env.SMTP_PASS,
}

const configFront = {
  frontUrl: process.env.FRONTEND_URL
}

module.exports = { config, configFront, authConfig, emailConfig };
