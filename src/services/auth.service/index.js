const boom = require('@hapi/boom');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { config } = require('../../config');
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
    });

    if (!user) {
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    if (!user.isActive) {
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw boom.unauthorized('usuario o contraseña incorrecto');
    }
    delete user.dataValues.password;
    user.dataValues.id = user.dataValues.userId;
    delete user.dataValues.userId;

    return user;
  }

  signToken(user) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '12h' });

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
    const user = await models.Auth.findOne({ where: { email } });
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15min' });
    const link = `http://myfrontend.com/recovery?token=${token}`;
    await service.update({ id: user.id, changes: { recoveryToken: token } });
    const mail = {
      from: config.smtpEmail,
      to: `${user.email}`,
      subject: 'Email para recuperar contraseña',
      html: `<b>Ingresa a este link => ${link}</b>`,
    };
    const rta = await this.sendMail(mail);
    return rta;
  }

  async changePassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOne({ id: payload.sub });
      if (user.recoveryToken !== token) {
        throw boom.unauthorized();
      }
      const hash = await bcryptjs.hash(newPassword, 10);
      await service.update({
        id: user.id,
        changes: { recoveryToken: null, password: hash },
      });
      return { message: 'password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
        user: config.smtpEmail,
        pass: config.smtpPass,
      },
    });
    await transporter.sendMail(infoMail);
    return { message: 'mail sent' };
  }
}

module.exports = AuthService;
