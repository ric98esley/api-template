const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const sequelize = require('../../libs/sequelize');
const { models } = require('../../libs/sequelize');

// const AssignmentService = require('../orders.service/assignments.service');
// const assignmentsService = new AssignmentService();

class AssetsServices {
  constructor() {}

  async create({ assets, user }) {
    console.log('create');
    const createdById = user.sub;
    const newAssets = await Promise.all(
      assets.map(async (asset) => {
        try {
          let specifications = undefined;
          console.log(asset.specifications);
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

  async createBulk({ assets, locationId, user }) {
    console.log('create bulk');
    const createdById = user.sub;
    console.log(assets);
    const data = assets.map((asset) => {
      return {
        ...asset,
        locationId,
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

    const createdAssets = newAssets.filter((asset) => asset.id !== null);
    const errorAssets = newAssets.filter((asset) => asset.id === null);

    return {
      created: createdAssets,
      errors: errorAssets,
    };
  }

  async findAssigments({ id, limit = 10, offset = 0 }) {
    const target = await this.findOne({ id });
    const assignments = await assignmentsService.findAssignmentTo({
      targetId: id,
      limit: Number(limit),
      offset: Number(offset),
      all: true,
    });
    const res = {
      target,
      assignments,
    };
    return res;
  }

  async findAssigned({ id, limit = 10, offset = 0, isCurrent }) {
    const target = await this.findOne({ id });
    const assigned = await assignmentsService.findAssignmentTo({
      assetId: id,
      limit: Number(limit),
      offset: Number(offset),
      isCurrent,
    });
    const res = {
      target,
      assigned,
    };
    return res;
  }

  async findOne({ id, enabled, status, groupId }) {
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
          required: true,
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
              model: models.group,
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
          attributes: ['id', 'name'],
          include: [
            {
              model: models.Category,
              as: 'category',
              required: true,
              attributes: ['id', 'name'],
            },
            {
              model: models.Brand,
              as: 'brand',
              required: true,
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
    enabled,
    groupId,
    invoiceId,
    warehouse,
    status,
    all,
    model,
    brand,
    category,
    warehouseId,
    modelId,
    categoryId,
    brandId,
    startDate,
    endDate,
  }) {
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      ...(all && {
        paranoid: false,
      }),
      where: {
        ...(enabled !== undefined && {
          enabled: enabled == 'true' ? true : false,
        }),
        ...(serial && {
          serial: {
            [Op.like]: `%${serial}%`,
          },
        }),
        ...(invoiceId && {
          invoiceId,
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
          required: true,
          attributes: ['id', 'name', 'code', 'typeId', 'groupId'],
          include: [
            {
              model: models.LocationType,
              as: 'type',
              attributes: ['id', 'name', 'status'],
              ...(status && {
                where: {
                  state: status,
                },
              }),
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
            ...(!modelId &&
              model && {
                name: {
                  [Op.like]: `%${model}%`,
                },
              }),
          },
          include: [
            {
              model: models.Category,
              as: 'category',
              required: true,
              attributes: ['id', 'name'],
              where: {
                ...(!modelId &&
                  categoryId && {
                    id: categoryId,
                  }),
                ...(!modelId &&
                  categoryId &&
                  category && {
                    name: {
                      [Op.like]: `%${category}%`,
                    },
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
                ...(!modelId &&
                  !brandId &&
                  brand && {
                    name: {
                      [Op.like]: `%${brand}%`,
                    },
                  }),
              },
            },
          ],
          attributes: ['id', 'name'],
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
      order: [[sort, order]],
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
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    groupId,
    warehouse,
    status,
    model,
    brand,
    category,
    startDate,
    endDate,
  }) {
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      where: {
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
        ...(status && {
          state: status,
        }),
        ...(warehouse && {
          warehouse: {
            [Op.like]: `%${warehouse}%`,
          },
        }),
        ...(groupId && {
          groupId,
        }),
        ...(model && {
          model: {
            [Op.like]: `%${model}%`,
          },
        }),
        ...(category && {
          category: {
            [Op.like]: `%${category}%`,
          },
        }),
        ...(brand && {
          brand: {
            [Op.like]: `%${brand}%`,
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
        'code',
        'location',
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
