const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const sequelize = require('../../libs/sequelize');
const { models } = require('../../libs/sequelize');
const { assetModel, maintenanceModel, assetSpecModel } = require('../../models');
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
      paranoid: false,
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

  async findOne({ id, enabled, status, groupId, paranoid = true }) {
    if (!id) {
      throw boom.badRequest('Id es requerido');
    }
    const where = {
      id,
      ...(enabled && {
        enabled: Boolean(enabled),
      }),
      ...(groupId && {
        '$location.group_id$': groupId,
      }),
      ...(status && {
        '$location.type.status$': status,
      }),
    };
    const options = {
      where,
      include: assetModel.include,
      attributes: assetModel.attributes,
      paranoid,
    };
    const Asset = await models.Asset.findOne(options);
    if (!Asset) {
      throw boom.notFound('Activo no encontrado');
    }
    return Asset;
  }

  async findBySerial({ serial, enabled, status, groupId, paranoid = true }) {
    const options = {
      where: {
        serial,
        ...(enabled && {
          enabled: Boolean(enabled),
        }),
        ...(groupId && {
          '$location.groupId$': groupId,
        }),
        ...(status && {
          '$location.type.status$': status,
        }),
      },
      include: assetModel.include,
      attributes: assetModel.attributes,
      paranoid,
    };
    const asset = await models.Asset.findOne(options);

    return asset;
  }

  async find({
    serial,
    limit = 10,
    offset = 0,
    sort = 'createdAt',
    order = 'DESC',
    location,
    group,
    type,
    groupId,
    status,
    all,
    model,
    brand,
    category,
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
      ...(startDate && {
        createdAt: {
          [Op.gte]: new Date(startDate).toISOString(),
        },
      }),
      ...(endDate && {
        createdAt: {
          [Op.lte]: new Date(endDate).toISOString(),
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
      ...(group && {
        [Op.or]: [
          {
            '$location.group.name$': {
              [Op.like]: `%${group}%`,
            },
          },
          {
            '$location.group.code$': {
              [Op.like]: `%${group}%`,
            },
          },
        ],
      }),
      ...(groupId && {
        '$location.group_id$': groupId,
      }),
    };
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      ...(all == 'true' && {
        paranoid: false,
      }),
      include: assetModel().include,
      attributes: assetModel().attributes,
      // where,
      order: [
        [...sort, order],
        ['serial', 'DESC'],
      ],
      distinct: true,
    };

    console.log(options.include);
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
    all,
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

    all == 'true' ? (all = true) : (all = false);
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
        ...(all && {
          deletedAt: {
            [Op.or]: [{ [Op.is]: null }, { [Op.not]: null }],
          },
        }),
        ...(!all && {
          deletedAt: {
            [Op.is]: null,
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
        'deletedAt',
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

  async getSpecifications({ id, groupId }) {
    const asset = await this.findOne({
      id,
      groupId,
      enabled: true,
      paranoid: false,
    });

    if (asset) {
      const specifications = await models.AssetSpec.findAndCountAll({
        where: {
          assetId: id,
        },
        include: assetSpecModel.include,
        attributes: assetSpecModel.attributes,
      });

      return {
        total: specifications.count,
        rows: specifications.rows,
      };
    }
  }

  async getMaintenance({ id }) {
    const maintenance = await models.Maintenance.findAndCountAll({
      where: {
        assetId: id,
      },
      include: maintenanceModel.include,
      order: [['createdAt', 'DESC']],
      attributes: maintenanceModel.attributes,
    });

    return {
      total: maintenance.count,
      rows: maintenance.rows,
    };
  }

  async updateSpecification({ id, changes, groupId, userId }) {
    const asset = await this.findOne({
      id,
      groupId,
      enabled: true,
      paranoid: false,
    });

    if (asset) {
      let spec = await models.AssetSpec.findOne({
        where: {
          assetId: Number(id),
          typeId: Number(changes.typeId),
        },
      });

      if (spec) {
        await spec.update({ ...changes, updatedById: userId });
      } else {
        spec = await models.AssetSpec.create({
          ...changes,
          assetId: id,
          createdById: userId,
        });
      }
      return spec;
    }
  }

  async removeSpecification({ id, typeId, groupId }) {
    const asset = await this.findOne({ id, groupId, paranoid: false });

    if (asset) {
      const spec = await models.AssetSpec.findOne({
        where: {
          assetId: Number(id),
          typeId: Number(typeId),
        },
      });
      if (spec) {
        await spec.destroy({ force: true });
      }
      return spec;
    }
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
  async restore({ id }) {
    const asset = await this.findOne({ id, enabled: true, paranoid: false });

    const rta = await asset.restore();

    return rta;
  }
}

module.exports = AssetsServices;
