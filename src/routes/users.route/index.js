const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const UserService = require('../../services/user.service');
const validatorHandler = require('../../middlewares/validator.handler');
const {
  checkPermissions,
  checkUser,
  checkAuth,
} = require('../../middlewares/auth.handler');

const LogService = require('../../services/log.service');

const logService = new LogService()

const {
  updateUserSchema,
  createUserSchema,
  getUserSchema,
  searchUserSchema,
} = require('../../schemas/user.schema/index.js');
const { SCOPE, ACTIONS } = require('../../utils/roles');

const router = express.Router();
const service = new UserService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchUserSchema, 'query'),
  checkAuth({ route: SCOPE.USERS, crud: ACTIONS.READ }),
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
  checkUser(),
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
  checkUser(),
  validatorHandler(getUserSchema, 'params'),
  checkAuth({ route: SCOPE.USERS, crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      const User = await service.findOne({ id, groupId });
      res.json(User);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createUserSchema, 'body'),
  checkAuth({route: SCOPE.USERS, crud: ACTIONS.CREATE}),
  async (req, res, next) => {
    try {
      const body = req.body;
      const user = req.user;
      if (body.role == 'superuser')
        throw boom.forbidden("you can't create a superuser");
      body.createdById = user.sub;
      const newUser = await service.create(body);

      await logService.create({
        type: ACTIONS.CREATE,
        table: 'users',
        targetId: newUser.dataValues.id,
        details: `El usuario ${user.sub} a registrado un nuevo usuario`,
        ip: req.ip,
        createdById: user.sub
      })

      if(newUser.dataValues.profile) {
        await logService.create({
          type: ACTIONS.CREATE,
          table: 'customer',
          targetId: newUser.dataValues.profile?.id,
          details: `El usuario ${newUser.dataValues.username} ha creado un perfil`,
          ip: req.ip,
          createdById: user.sub
        })
      }
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  checkAuth({route: SCOPE.USERS, crud: ACTIONS.UPDATE}),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { groupId } = req.query;
      const { id } = req.params;
      const body = req.body;

      const userUpdated = await service.update({ id, changes: body, groupId });

      await logService.create({
        type: ACTIONS.CREATE,
        table: 'users',
        targetId: id,
        details: {
          message: `Se modificado el usuario ${userUpdated.dataValues.id}`,
          query: body
        },
        ip: req.ip,
        createdById: user.sub
      })
      res.json(userUpdated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkAuth({route: SCOPE.USERS, crud: ACTIONS.DELETE}),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { groupId } = req.query;

      const user = await service.delete({id, groupId});

      await logService.create({
        type: ACTIONS.CREATE,
        table: 'users',
        targetId: id,
        details: `Se ha ocultado el usuario ${user.dataValues.id}`,
        ip: req.ip,
        createdById: user.sub
      })
      res.status(202).json({
        message: 'Haz ocultado el usuario',
        target: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/assets',
  passport.authenticate('jwt', { session: false }),
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
