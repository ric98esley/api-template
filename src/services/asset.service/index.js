const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const sequelize = require('../../libs/sequelize');
const { models } = require('../../libs/sequelize');

// const AssignmentService = require('../orders.service/assignments.service');
// const assignmentsService = new AssignmentService();

class AssetsServices {
  constructor() {}

  async getTag(business) {
    const settings = await models.Settings.findOne({
      where: {
        business,
      },
    });
    const { prefix, next, zeroFill } = settings.dataValues;
    const filled = `${next}`.padStart(zeroFill, '0');
    const tag = `${prefix}${filled}`;
    await settings.update({
      next: next + 1,
    });
    return { tag };
  }

  async create({ assets, user }) {
    const createdById = user.sub;
    const newAssets = await Promise.all(
      assets.map(async (asset) => {
        try {
          let specifications = undefined;
          if (asset.specifications) {
            specifications = asset.specifications.map((specificaction) => ({
              ...specificaction,
              createdById,
              updatedById: createdById,
            }));
          }

          const toCreate = {
            ...asset,
            createdById,
            ...(specifications && {
              specifications,
            }),
            countChecking: 1,
          };

          const newAsset = await models.Asset.create(toCreate, {
            include: ['specifications'],
          });

          return newAsset;
        } catch (error) {
          console.log(error);
          return asset;
        }
      })
    );

    const createdAssets = newAssets.filter(
      (asset) => asset.id !== null && asset.id !== undefined
    );
    const errorAssets = newAssets.filter(
      (asset) => asset.id === null || asset.id === undefined
    );

    return {
      created: createdAssets,
      errors: errorAssets,
    };
  }

  async createBulk({ assets, user }) {
    const createdById = user.sub;

    const assetSerial = assets.map((asset) => String(asset.serial).trim());

    const assetsFound = await models.Asset.findAll({
      where: {
        serial: assetSerial,
      },
    });

    const assetToCreate =
      assets
        .map((asset) => {
          const found = assetsFound.find(
            (assetFound) =>
              assetFound.dataValues.serial ==
              String(asset.serial).toUpperCase().trim()
          );

          if (!found) {
            return asset;
          }
        })
        .filter((asset) => asset !== undefined) || [];

    const data = assetToCreate.map((asset) => {
      return {
        ...asset,
        createdById,
        updatedById: createdById,
        countChecking: 1,
        ...(asset.specifications && {
          specifications: asset.specifications.map((specification) => ({
            ...specification,
            createdById,
            updatedById: createdById,
          })),
        }),
      };
    });

    const newAssets = await models.Asset.bulkCreate(data, {
      include: ['specifications'],
      ignoreDuplicates: true,
    });

    return {
      created: newAssets,
      errors: assetsFound,
    };
  }

  async findOne({ id, enabled, status, groupId, type, paranoid = true }) {
    const options = {
      where: {
        id,
        ...(enabled && {
          enabled: Boolean(enabled),
        }),
      },
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Location,
          as: 'location',
          attributes: ['id', 'name', 'code', 'typeId', 'groupId'],
          include: [
            {
              model: models.LocationType,
              as: 'type',
              attributes: ['id', 'name', 'status'],
              where: {
                ...(status && {
                  status,
                }),
              },
            },
            {
              model: models.Group,
              as: 'group',
              attributes: ['id', 'name'],
            },
          ],
          where: {
            ...(groupId && {
              groupId,
            }),
          },
        },
        {
          model: models.Model,
          as: 'model',
          required: true,
          attributes: ['id', 'name'],
          include: [
            {
              model: models.Category,
              as: 'category',
              required: true,
              attributes: ['id', 'name', 'type'],
              where: {
                ...(type && {
                  type,
                }),
              },
            },
            {
              model: models.Brand,
              as: 'brand',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: models.AssetSpec,
          as: 'specifications',
          include: [
            {
              model: models.HardwareSpec,
              as: 'type',
              attributes: ['id', 'name'],
            },
          ],
          attributes: ['id', 'value'],
        },
      ],
      attributes: [
        'id',
        'serial',
        'notes',
        'countChecking',
        'enabled',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      paranoid,
    };
    const Asset = await models.Asset.findOne(options);
    if (!Asset) {
      throw boom.notFound('Asset not found');
    }
    return Asset;
  }

  async find({
    serial,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    location,
    specification,
    specificationValue,
    type,
    groupId,
    status,
    all,
    model,
    brand,
    category,
    modelId,
    categoryId,
    brandId,
    startDate,
    endDate,
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }
    sort = sort.split(',');

    const where = {
      ...(serial && {
        serial: {
          [Op.like]: `%${serial}%`,
        },
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            [Op.between]: [
              new Date(startDate).toISOString(),
              new Date(endDate).toISOString(),
            ],
          },
        }),
      ...(location && {
        [Op.or]: [
          {
            '$location.name$': {
              [Op.like]: `%${location}%`,
            },
          },
          {
            '$location.code$': {
              [Op.like]: `%${location}%`,
            },
          },
        ],
      }),
      ...(status && {
        '$location.type.status$': {
          [Op.eq]: status,
        },
      }),
      ...(model && {
        '$model.name$': {
          [Op.or]: model.split(',').map((m) => ({
            [Op.like]: `%${m}%`,
          })),
        },
      }),
      ...(category && {
        '$model.category.name$': {
          [Op.or]: category.split(',').map((c) => ({
            [Op.like]: `%${c}%`,
          })),
        },
      }),
      ...(type && {
        '$model.category.type$': {
          [Op.or]: type.split(',').map((t) => ({
            [Op.like]: `%${t}%`,
          })),
        },
      }),
      ...(brand && {
        '$model.brand.name$': {
          [Op.or]: brand.split(',').map((b) => ({
            [Op.like]: `%${b}%`,
          })),
        },
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      ...(all == 'true' && {
        paranoid: false,
      }),
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'username'],
        },
        {
          model: models.Location,
          as: 'location',
          attributes: ['id', 'name', 'code', 'typeId', 'groupId'],
          include: [
            {
              model: models.LocationType,
              as: 'type',
              attributes: ['id', 'name', 'status'],
            },
            {
              model: models.Group,
              as: 'group',
              attributes: ['id', 'code', 'name'],
            },
          ],
          where: {
            ...(groupId && {
              groupId,
            }),
          },
        },
        {
          model: models.Model,
          as: 'model',
          required: true,
          where: {
            ...(modelId && {
              id: modelId,
            }),
          },
          include: [
            {
              model: models.Category,
              as: 'category',
              required: true,
              attributes: ['id', 'name'],
              where: {
                ...(categoryId && {
                  id: categoryId,
                }),
              },
            },
            {
              model: models.Brand,
              as: 'brand',
              required: true,
              attributes: ['id', 'name'],
              where: {
                ...(!modelId &&
                  !categoryId &&
                  brandId && {
                    id: brandId,
                  }),
              },
            },
          ],
          attributes: ['id', 'name'],
        },
      ],
      where,
      order: [[...sort, order], ['serial', 'DESC']],
      distinct: true,
      attributes: [
        'id',
        'serial',
        'notes',
        'countChecking',
        'enabled',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    };
    const { count, rows } = await models.Asset.findAndCountAll(options);
    return {
      total: count,
      rows,
    };
  }
  async vFind({
    serial,
    location,
    type,
    group,
    status,
    model,
    brand,
    category,
    startDate,
    endDate,
    groupId,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
  }) {
    if (!isNaN(startDate)) {
      startDate = Number(startDate);
      endDate = Number(endDate);
    }
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where: {
        ...(serial && {
          serial: {
            [Op.like]: `%${serial}%`,
          },
        }),
        ...(status && {
          status,
        }),
        ...(startDate &&
          endDate && {
            createdAt: {
              [Op.between]: [
                new Date(startDate).toISOString(),
                new Date(endDate).toISOString(),
              ],
            },
          }),
        ...(location && {
          [Op.or]: [
            {
              locationCode: {
                [Op.like]: `%${location}%`,
              },
            },
            {
              location: {
                [Op.like]: `%${location}%`,
              },
            },
          ],
        }),
        ...(group && {
          [Op.or]: [
            {
              groupCode: {
                [Op.like]: `%${group}%`,
              },
            },
            {
              group: {
                [Op.like]: `%${group}%`,
              },
            },
          ],
        }),
        ...(groupId && {
          groupId,
        }),
        ...(model && {
          model: {
            [Op.or]: model.split(',').map((m) => ({
              [Op.like]: `%${m}%`,
            })),
          },
        }),
        ...(category && {
          category: {
            [Op.or]: category.split(',').map((c) => ({
              [Op.like]: `%${c}%`,
            })),
          },
        }),
        ...(brand && {
          brand: {
            [Op.or]: brand.split(',').map((b) => ({
              [Op.like]: `%${b}%`,
            })),
          },
        }),
      },
      order: [[sort, order]],
      distinct: true,
      attributes: [
        'id',
        'serial',
        'category',
        'model',
        'brand',
        'locationCode',
        'location',
        'groupCode',
        'status',
        'createdAt',
      ],
    };

    const { count, rows } = await models.VAsset.findAndCountAll(options);
    return {
      total: count,
      rows: rows,
    };
  }

  async update(id, changes, transaction) {
    const Asset = await this.findOne({ id });

    const rta = await Asset.update(changes, { transaction });

    return rta;
  }

  async updateBulk({ targets, userId }) {
    const transaction = await sequelize.transaction();

    try {
      const assetsUpdated = await Promise.all(
        targets.map(async (target) => {
          const { id, ...updateFields } = target;
          updateFields.updatedById = userId;
          const asset = await this.update(id, updateFields, transaction);

          return asset;
        })
      );

      await transaction.commit();
      return assetsUpdated;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete({ id, deletedById }) {
    const asset = await this.findOne({ id, enabled: true });

    await asset.update({
      deletedById,
    });

    const rta = await asset.destroy({});

    return rta;
  }
}

module.exports = AssetsServices;
