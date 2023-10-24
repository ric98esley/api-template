const express = require('express');
const passport = require('passport');

// Middlewares
const { checkRoles, checkPermissions } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');

// Schemas
const {
  createGroup,
  searchGroup,
  getGroup,
  updateGroup,
} = require('../../schemas/group.schema');
const GroupsService = require('../../services/group.service');

const router = express.Router();

// service

const groupService = new GroupsService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(searchGroup, 'query'),
  checkPermissions,
  async (req, res, next) => {
    try {
      const query = req.query;
      const groups = await groupService.find(query);

      res.status(201).json(groups);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(createGroup, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.createdById = req.user.sub;
      const newGroup = await groupService.create(body);

      res.status(200).json(newGroup);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getGroup, 'params'),
  validatorHandler(updateGroup, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const changes = req.body;
      const groupUpdated = await groupService.update({ changes, id });

      res.status(201).json(groupUpdated);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getGroup, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const groupDeleted = await groupService.delete({ id });

      res.status(201).json(groupDeleted);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
