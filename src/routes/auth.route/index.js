const express = require('express');
const passport = require('passport');

const AuthService = require('./../../services/auth.service');
const UsersServices = require('../../services/user.service');
const LogService = require('../../services/log.service');
const { ACTIONS } = require('../../utils/roles');

const router = express.Router();
const authService = new AuthService();
const userService = new UsersServices();
const logService = new LogService();

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;

      console.log(user);
      await logService.create({
        type: 'login',
        table: 'users',
        targetId: user.id,
        details: `El usuario ${user.username} a entrado al sistema`,
        ip: req.ip,
        createdById: user.id,
      });

      res.json(authService.signToken(user));
    } catch (error) {
      next(error);
    }
  }
);

router.get('/google', async (req, res, next) => {
  try {
  } catch (error) {}
});
router.post('/sing-up', async (req, res, next) => {
  try {
    const data = req.body;
    data.isActive = true;

    const newUser = await userService.create(data);

    await logService.create({
      type: ACTIONS.CREATE,
      table: 'users',
      targetId: newUser.dataValues.id,
      details: 'Se registrado un nuevo usuario',
      ip: req.ip,
      createdById: null,
    });

    if (newUser.dataValues.profile) {
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'customer',
        targetId: newUser.dataValues.profile?.id,
        details: `El usuario ${newUser.dataValues.username} ha creado un perfil`,
        ip: req.ip,
        createdById: null,
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post('/recovery', async (req, res, next) => {
  try {
    const { email } = req.body;
    const { user, rta } = await authService.sendRecovery(email);

    await logService.create({
      type: 'recovery',
      table: 'users',
      targetId: user.dataValues.id,
      details: `El usuario ${user.dataValues.username} ha solicitado cambiar contraseña`,
      ip: req.ip,
      createdById: null,
    });
    res.json(rta);
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const { user, message } = await authService.changePassword(token, password);
    await logService.create({
      type: 'recovery',
      table: 'users',
      targetId: user.dataValues.id,
      details: `El usuario ${user.dataValues.username} ha cambiado la contraseña`,
      ip: req.ip,
      createdById: null,
    });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
