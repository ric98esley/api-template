const { Strategy, ExtractJwt } = require('passport-jwt');

const { authConfig } = require('../../../config');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authConfig.jwtRefresh,
}

const RefreshJwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});

module.exports = RefreshJwtStrategy;