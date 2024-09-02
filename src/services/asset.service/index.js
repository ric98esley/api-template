const boom = require('@hapi/boom');
const { Op } = require('sequelize');

const { models } = require('../../libs/sequelize');
const {
  assetModel,
  maintenanceModel,
  assetSpecModel,
} = require('../../models');
const { re } = require('mathjs');
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

  async create({ asset, user }) {
    const createdById = user.sub;
    const newAsset = await models.Asset.create(
      {
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
      },
      {
        include: ['specifications'],
      }
    );

    const res = await this.findOne({ id: newAsset.id });

    return res;
  }

  async createBulk({ assets, user, groupId }) {
    const data = [];
    const assetsDisabled = [];

    const assetSerials = assets.map((asset) =>
      String(asset.serial).trim().toUpperCase()
    );

    const foundAssets = await models.Asset.findAll({
      where: {
        serial: assetSerials,
      },
      paranoid: false,
    });

    // Filtrar activos que no existen en la base de datos
    const foundSerials =
      new Set(foundAssets.map((asset) => asset.serial)) || [];

    const assetsToCreate =
      assets.filter(
        (asset) => !foundSerials.has(String(asset.serial).trim().toUpperCase())
      ) || [];

    // Obtener todas las ubicaciones de una sola vez
    const locations = await models.Location.findAll({
      where: {
        id: [...new Set(assetsToCreate.map((asset) => asset.locationId))],
        ...(groupId && { groupId }),
      },
    });

    const validLocationIds = new Set(locations.map((location) => location.id));

    const createPromises = assetsToCreate.map(async (asset) => {
      if (validLocationIds.has(asset.locationId)) {
        const created = await this.create({ asset, user });
        data.push(created);
      } else {
        assetsDisabled.push({
          serial: asset.serial,
          message: 'No puede crear activos en esta ubicación',
        });
      }
    });

    await Promise.all(createPromises);

    return {
      created: data,
      errors: [
        ...foundAssets.map((asset) => ({
          serial: asset.serial,
          message: 'Activo ya existe',
        })),
        ...assetsDisabled,
      ],
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
      include: assetModel().include,
      attributes: assetModel().attributes,
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
      include: assetModel().include,
      attributes: assetModel().attributes,
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
      where,
      order: [
        [...sort, order],
        ['serial', 'DESC'],
      ],
      distinct: true,
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

  async update(id, changes, groupId) {
    const asset = await this.findOne({ id, groupId });

    await asset.update(changes);

    return await this.findOne({ id });
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
        include: assetSpecModel().include,
        attributes: assetSpecModel().attributes,
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
      include: maintenanceModel().include,
      order: [['createdAt', 'DESC']],
      attributes: maintenanceModel().attributes,
    });

    return {
      total: maintenance.count,
      rows: maintenance.rows,
    };
  }

  async getSpecification({ assetId, typeId }) {
    return await models.AssetSpec.findOne({
      where: {
        assetId: assetId,
        typeId,
      },
      include: assetSpecModel().include,
      attributes: assetSpecModel().attributes,
    });
  }

  async updateSpecification({ id, changes, userId }) {
    let spec = await this.getSpecification({
      assetId: id,
      typeId: changes.typeId,
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

    return await this.getSpecification({ assetId: id, typeId: changes.typeId });
  }

  async removeSpecification({ id, typeId }) {
    const spec = await this.getSpecification({ assetId: id, typeId });

    if (!spec) {
      throw boom.notFound('Especificación no encontrada');
    }
    await spec.destroy({ force: true });
    return spec;
  }

  async delete({ id, deletedById, groupId }) {
    const asset = await this.findOne({ id, groupId, enabled: true });

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
