var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('./config.js');
var mysql = require('mysql');

//MySQL Connection
var pool  = mysql.createPool({
  host     : config.dbhost,
  user     : config.dbuser,
  password : config.dbsecret,
  database : config.dbname
});

var passport_jwt_options = {};
passport_jwt_options.secretOrKey = config.secret;
passport_jwt_options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// example Auth Header: "Authorization: bearer <token>"
passport_jwt_options.ignoreExpiration = false;

function generate_jwt_token(email) {
    return jwt.sign({email: email, issue_time: Date.now()}, config.secret, {
        expiresIn: 60*60*24*7 // 1 week
    });
}

passport.use(new BasicStrategy(
    function(email, password, callback) {
      pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('SELECT * FROM ?? WHERE email = ?', ['users', email], function (err, results, fields) {
          // And done with the connection.
          connection.release();

          if (err) return callback(err);
          if (!results[0]) return callback(null, false);

          // check the password
          if(results[0].password === password){
            return callback(null, results[0]);
          }
          return callback(null, false);
        });
      });
    }
));

var authenticateBasic = passport.authenticate('basic', {session: false});

passport.use(new JwtStrategy(passport_jwt_options, function(jwt_payload, callback) {
  pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query('SELECT * FROM ?? WHERE email = ?', ['users', jwt_payload.email], function (err, results, fields) {
      // And done with the connection.
      connection.release();

      if (err) return callback(err, false);
      if (results) return callback(null, results[0]);

      return callback(null, false);
    });
    return authenticateBasic;
  });
}));

var authenticateJwt = passport.authenticate('jwt', {session: false});

exports.isAuthenticated = authenticateJwt;
exports.isAuthenticatedBasic = authenticateBasic;
exports.generate_jwt_token = generate_jwt_token;
