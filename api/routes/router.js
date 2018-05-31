var express = require('express');
var config = require('../config.js');
var mysql = require('mysql');
var path = require('path');
var router = express.Router(); // new instance of express router
var auth = require('../auth.js');
var jwt = require('jsonwebtoken');

const API_SUCCESS_MSG = {success: true, error: null};
const API_FAILURE_MSG = {success: false, error: null};

//MySQL Connection
var pool  = mysql.createPool({
  host     : config.dbhost,
  user     : config.dbuser,
  password : config.dbsecret,
  database : config.dbname
});

//show user information hiding password
function make_user_safe(user) {
  return {
    name: user.name,
    surname: user.surname,
    email: user.email
  }
}

function verify_user_action_authorized(user, requested_username, callback) {
    if (user.id != requested_id) { // user requesting action on other user
        if (!user.is_superuser) { // user is not superuser
            return callback(null, false);
        }
    }
    return callback(user, true);
}

router.use(function(req, res, next) {
    var token = req.headers['authorization'];
    if (token && token.substr(0,6)=='bearer') {
        token = token.substr(7);
        var decoded = jwt.verify(token, config.secret);
        // if 1 hour passed since token issue
        if (Date.now() - decoded.issue_time >= config.jwt_refresh_time) {
            var n_token = auth.generate_jwt_token(decoded.username);
            res.token = {};
            // check in the frontend and get this new token
            res.token.newtoken = n_token;
        }
    }
    next();
});

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany", effettua una richiesta valida :)'
    });
});

//Authenticate an user who send valid log in credentials
router.route('/authenticate').post(auth.isAuthenticatedBasic, function(req,res) {
    var token = auth.generate_jwt_token(req.user.email);
    res.json({
        success: true,
        user: make_user_safe(req.user),
        token: token,
    });
});

//register a new user(POST)
router.route('/users').post(function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      var post  = {password: req.body.password, name: req.body.name, surname: req.body.surname, email: req.body.email};
      connection.query('INSERT INTO ?? SET ?', ['users', post], function (err, results, fields) {
        // And done with the connection.
        connection.release();

        if (err) return res.json({success:false, error:err});
        else res.json(API_SUCCESS_MSG);
      });
    });
});

module.exports = router;
