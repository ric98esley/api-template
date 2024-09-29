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
            email: username,
          },
          {
            username,
          },
        ],
      },
      attributes: ['id', 'username', 'email', 'role', 'password', 'isActive'],
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

    return user;
  }

  async getPermissions(roleName) {
    const role = await models.Role.findOne({
      where: {
        name: roleName,
      },
      attributes: ['id', 'name', 'ability'],
    });

    if (!role) return [];

    const ability = JSON.parse(role.dataValues.ability);

    let result = [];

    for (let category in ability) {
      for (let action in ability[category]) {
        if (ability[category][action] !== 'none')
          result.push(`${category}:${action}`);
      }
    }

    return result;
  }

  signToken(user, secret = authConfig.jwtSecret, expiresIn = '20s') {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });

    return token;
  }

  async saveSession({ userId, token, ip }) {
    const session = await models.Session.create({
      token,
      ip,
      userId: userId,
    });

    return session;
  }

  async findSession(token) {
    const session = await models.Session.findOne({
      where: {
        token,
      },
    });

    return session;
  }

  async singIn(user, ip) {
    const token = this.signToken(user);
    const refreshToken = this.signToken(user, authConfig.jwtRefresh, '7d');
    const ability = await this.getPermissions(user.role);

    await this.saveSession({ userId: user.id, token: refreshToken, ip });

    const data = {
      user,
      token,
      refreshToken,
      ability,
    };
    return data;
  }

  async checkUser(userId) {
    const user = await models.User.findByPk(userId, {
      where: {
        isActive: true,
      },
      attributes: ['id', 'username', 'email', 'role', 'isActive'],
    });
    if (!user) {
      throw boom.unauthorized();
    }

    const ability = await this.getPermissions(user.role);
    const token = this.signToken(user);

    return {
      user,
      ability,
      token,
    };
  }

  async attempt({ user, ip }) {
    const attempt = await models.Log.create({
      type: 'login',
      table: 'users',
      targetId: user.id,
      details: `El usuario ${user.username} a entrado al sistema`,
      ip,
      createdById: user.id,
    });
    return attempt;
  }

  async sendRecovery(email) {
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { sub: user.id };
    const token = jwt.sign(payload, authConfig.jwtRecovery, {
      expiresIn: '15min',
    });
    const link = `${configFront.frontUrl}/change-password?token=${token}`;
    await service.update({ id: user.id, changes: { recoveryToken: token } });
    const mail = {
      from: emailConfig.smtpEmail,
      to: `${user.email}`,
      subject: 'Email para recuperar contraseña',
      html: `<b>Hemos recibido una solicitud de cambio de contraseña para el sistema de inventario,
              por favor ingresa al siguiente link solo si lo solicitaste => ${link}</b>`,
    };
    const rta = await this.sendMail(mail);
    return {
      user,
      rta,
    };
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
      return { user, message: 'password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async sendMail(infoMail) {
    const config = {
      host: emailConfig.smtpHost,
      secure: true,
      port: 465,
      auth: {
        user: emailConfig.smtpEmail,
        pass: emailConfig.smtpPass,
      },
    };

    const transporter = nodemailer.createTransport(config);

    await transporter.sendMail(infoMail);
    return { message: 'mail sent' };
  }
}

module.exports = AuthService;
