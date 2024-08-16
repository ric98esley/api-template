const passport = require('passport');

const LocalStrategy = require('./strategies/local.strategy');
const JwtStrategy = require('./strategies/jwt.strategy');
const RefreshJwtStrategy = require('./strategies/refresh.strategy');

passport.use(LocalStrategy);
passport.use(JwtStrategy);
passport.use('refresh', RefreshJwtStrategy);
