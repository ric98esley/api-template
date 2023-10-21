const { GoogleStrategy } = require('passport-google-oauth20');
const { config } = require('../../../config');

passport.use(new GoogleStrategy({
    clientID: config.googleClienteId,
    clientSecret: config.googleClienteSecret,
    callbackURL: 'http://localhost:3006/auth/google',
    scope: [ 'profile' ],
    state: true
  },
  function verify(accessToken, refreshToken, profile, cb) {
    db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
      'https://accounts.google.com',
      profile.id
    ], function(err, cred) {
      if (err) { return cb(err); }
      
      if (!cred) {
        // The account at Google has not logged in to this app before.  Create a
        // new user record and associate it with the Google account.
        db.run('INSERT INTO users (name) VALUES (?)', [
          profile.displayName
        ], function(err) {
          if (err) { return cb(err); }
          
          var id = this.lastID;
          db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
            id,
            'https://accounts.google.com',
            profile.id
          ], function(err) {
            if (err) { return cb(err); }
            
            var user = {
              id: id,
              name: profile.displayName
            };
            return cb(null, user);
          });
        });
      } else {
        // The account at Google has previously logged in to the app.  Get the
        // user record associated with the Google account and log the user in.
        db.get('SELECT * FROM users WHERE id = ?', [ cred.user_id ], function(err, user) {
          if (err) { return cb(err); }
          if (!user) { return cb(null, false); }
          return cb(null, user);
        });
      }
    });
  }
));