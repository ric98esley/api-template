const boom = require('@hapi/boom');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { emailConfig, configFront, authConfig } = require('../../config');
const { models } = require('../../libs/sequelize');

const UserService = require('../user.service');
const { Op } = require('sequelize');
const service = new UserService();

class AuthService {
  async getUser(username, password) {
    const user = await models.User.findOne({
      where: {
        [Op.or]: [
          {
            email: username
          },
          {
            username
          }
        ]
      },
      attributes: ['id', 'username', 'email', 'role', 'password', 'permissions', 'isActive']
    });

    if (!user) {
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    if (!user.isActive) {
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.error('match')
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    delete user.dataValues.password;

    return user;
  }

  signToken(user) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, authConfig.jwtSecret, { expiresIn: '12h' });

    return {
      user,
      token,
    };
  }

  async attempt({ username, ip }) {
    const attempt = await models.Attempt.create({
      username,
      ip,
    });
    return attempt;
  }

  async sendRecovery(email) {
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { sub: user.id };
    const token = jwt.sign(payload, authConfig.jwtRecovery, { expiresIn: '15min' });
    const link = `${configFront.frontUrl}/recovery?token=${token}`;
    await service.update({ id: user.id, changes: { recoveryToken: token } });
    const mail = {
      from: emailConfig.smtpEmail,
      to: `${user.email}`,
      subject: 'Email para recuperar contraseña',
      html: `<b>Ingresa a este link => ${link}</b>`,
    };
    const rta = await this.sendMail(mail);
    return rta;
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, authConfig.jwtRecovery);
      const user = await models.User.findByPk(payload.sub);
      if (user.recoveryToken !== token) {
        throw boom.unauthorized();
      }
      await service.update({
        id: user.id,
        changes: { recoveryToken: null, password: newPassword },
      });
      return { message: 'password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      secure: true,
      port: 465,
      auth: {
        user: emailConfig.smtpEmail,
        pass: emailConfig.smtpPass,
      },
    });
    await transporter.sendMail(infoMail);
    return { message: 'mail sent' };
  }
}

module.exports = AuthService;
