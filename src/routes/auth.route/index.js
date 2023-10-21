const express = require('express');
const passport = require('passport');

const AuthService = require('./../../services/auth.service');
const UsersServices = require('../../services/user.service');

const router = express.Router();
const authService = new AuthService();
const userService = new UsersServices();

router.post('/login',
  passport.authenticate('local', {session: false}),
  async (req, res, next) => {
    try {
      const user = req.user;
      await authService.attempt({ username: user.username, ip: req.ip });

      res.json(authService.signToken(user));
    } catch (error) {
      next(error);
    }
  }
);

router.get('/google',async (req, res, next) => {
  try {
    
  } catch (error) {
    
  }
})
router.post('/sing-up',
  async (req, res, next) => {
    try {
      const data = req.body;
      data.isActive = true;

      const newUser = await userService.create(data);

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);



router.post('/recovery',
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const rta = await authService.sendRecovery(email);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/change-password',
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const rta = await authService.changePassword(token, password);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;