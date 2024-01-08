class GroupHierarchy {
  async getGroupsByManagerId(userId) {
    const recursiveQuery = `
        WITH RECURSIVE GroupHierarchy AS
          ( SELECT
              id,
              name,
              manager_id,
              parent_id
                FROM groups
                  WHERE manager_id = ${userId} UNION ALL
                  SELECT g.id, g.name, g.manager_id, g.parent_id
                  FROM groups AS g
                INNER JOIN GroupHierarchy AS gh ON g.parent_id = gh.id )
                  SELECT id FROM GroupHierarchy;
        `;

    const rta = await sequelize.query(recursiveQuery, {
      type: sequelize.QueryTypes.SELECT,
    });
    const groupId = rta.map((group) => group.id);
    return groupId;
  }

  async getGroupsByParentId(userGroupId) {
    const recursiveQuery = `
        WITH RECURSIVE GroupHierarchy AS
          ( SELECT
              id,
              name,
              manager_id,
              parent_id
                FROM groups
                  WHERE id = ${userGroupId} UNION ALL
                  SELECT g.id, g.name, g.manager_id, g.parent_id
                  FROM groups AS g
                INNER JOIN GroupHierarchy AS gh ON g.parent_id = gh.id )
                  SELECT id FROM GroupHierarchy;
        `;

    const rta = await sequelize.query(recursiveQuery, {
      type: sequelize.QueryTypes.SELECT,
    });
    const groupId = rta.map((group) => group.id);
    return groupId;
  }
}

module.exports = GroupHierarchy;