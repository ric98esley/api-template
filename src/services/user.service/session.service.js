class SessionService {
  async create({ token, ip, userId }) {
    return await models.Session.create({
      token,
      ip,
      userId: userId,
    });
  }

  async find(token) {
    return await models.Session.findOne({
      where: {
        token,
      },
    });
  }

  async delete(token) {
    return await models.Session.destroy({
      where: {
        token,
      },
    });
  }
}