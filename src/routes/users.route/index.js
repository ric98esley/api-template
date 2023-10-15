const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const UserService = require('../../services/user.service');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  checkRoles,
  checkPermissions,
  checkRoles2,
  checkAuth,
} = require('../../middlewares/auth.handler');

const {
  updateUserSchema,
  createUserSchema,
  getUserSchema,
  getSearch,
} = require('../../schemas/user.schema.js');

const router = express.Router();
const service = new UserService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles2({ route: 'users', crud: 'read' }),
  // validatorHandler(getSearch, 'query'),
  checkAuth({ route: 'users', crud: 'read' }),
  async (req, res, next) => {
    try {
      const toSearch = req.query;
      let users = await service.find(toSearch);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const id = req.user.sub;
      const User = await service.findOne({ id });
      res.json(User);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('tecnico', 'auditor', 'superuser'),
  // validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const User = await service.findOne({ id });
      res.json(User);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('auditor', 'superuser', 'receptor'),
  // validatorHandler(createUserSchema, 'body'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      if (body.role == 'superuser')
        throw boom.forbidden("you can't create a superuser");
      body.createdById = user.sub;
      const newUser = await service.create(body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('auditor', 'superuser', 'receptor'),
  // validatorHandler(getUserSchema, 'params'),
  // validatorHandler(updateUserSchema, 'body'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const { groupId } = req.query;
      const { id } = req.params;
      const body = req.body;

      const User = await service.update({ id, changes: body, groupId });
      res.json(User);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('auditor', 'superuser'),
  // validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await service.delete(id);
      res.status(202).json({
        msg: 'Haz desactivado el usario',
        user: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assets',
  passport.authenticate('jwt', { session: false }),
  checkRoles('auditor', 'superuser'),
  // validatorHandler(getSearch, 'query'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const toSearch = req.query;
      try {
        let users = await service.findAssigned({ id, ...toSearch });
        res.json(users);
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
