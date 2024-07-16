class MaintenanceService {
  async create({ cost, description, assetId, type, createdById}) {
    const maintenance = await models.Maintenance.create({
      description,
      cost,
      assetId,
      maintenanceTypeId: type,
      createdById,
    });
    return maintenance;
  }
}