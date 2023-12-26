const express = require('express');
const passport = require('passport');

// Middlewares
const { checkAuth, checkUser } = require('../../middlewares/auth.handler');
const validatorHandler = require('../../middlewares/validator.handler');
const { upload } = require('../../middlewares/upload.handler');

// Schemas
const {
  createGroup,
  searchGroup,
  getGroup,
  updateGroup,
} = require('../../schemas/group.schema');
const GroupsService = require('../../services/group.service');

const LogService = require('../../services/log.service');
const logService = new LogService();
const { ACTIONS } = require('../../utils/roles');
const { parseCSV } = require('../../helpers/parseCSV.helper');

const router = express.Router();

// service

const groupService = new GroupsService();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(searchGroup, 'query'),
  checkAuth({ route: 'groups', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const query = req.query;
      const groups = await groupService.find(query);

      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getGroup, 'params'),
  checkAuth({ route: 'groups', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const groups = await groupService.findOne({ id });

      res.status(201).json(groups);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/locations',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getGroup, 'params'),
  checkAuth({ route: 'groups', crud: ACTIONS.READ }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const groups = await groupService.find({ groupId: id });

      res.status(201).json(groups);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(createGroup, 'body'),
  checkAuth({ route: 'groups', crud: ACTIONS.CREATE }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const body = req.body;
      body.createdById = user.sub;
      const newGroup = await groupService.create(body);

      const details = {
        message: `Se ha creado el grupo ${newGroup.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.CREATE,
        table: 'groups',
        targetId: newGroup.dataValues.id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(200).json(newGroup);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/import',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  checkAuth({ route: 'groups', crud: ACTIONS.CREATE }),
  upload.single('uploaded_file'),
  async (req, res, next) => {
    try {
      const filePath = req.file.path;
      const csvData = await parseCSV(filePath, ',', req.user.sub);

      const importedGroups = await groupService.createMany(csvData);
      const total = importedGroups.filter((group) => group.isNewRecord);

      res.status(201).json(
        {
          message: 'Se han importado ' + total.length + ' grupos',
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getGroup, 'params'),
  validatorHandler(updateGroup, 'body'),
  checkAuth({ route: 'groups', crud: ACTIONS.UPDATE }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const changes = req.body;
      const groupUpdated = await groupService.update({ changes, id });

      const details = {
        message: `Se ha modificado el grupo`,
        query: changes,
      };
      await logService.create({
        type: ACTIONS.UPDATE,
        table: 'groups',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res.status(201).json(groupUpdated);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  checkUser(),
  validatorHandler(getGroup, 'params'),
  checkAuth({ route: 'categories', crud: ACTIONS.DELETE }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const groupDeleted = await groupService.delete({ id });

      const details = {
        message: `Se ha ocultado el grupo ${groupDeleted.dataValues.name}`,
      };
      await logService.create({
        type: ACTIONS.DELETE,
        table: 'groups',
        targetId: id,
        details,
        ip: req.ip,
        createdById: user.sub,
      });

      res
        .status(201)
        .json({ message: 'Se ha ocultado el grupo', target: groupDeleted });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
