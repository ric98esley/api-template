const { Strategy, ExtractJwt } = require('passport-jwt');

const { authConfig } = require('../../../config');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authConfig.jwtSecret,
  expiresIn: '6d'
}

const JwtStrategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});

module.exports = JwtStrategy;