/**
 * @api {get} /user/:id
 * @apiName WonderfulCompany Welcome response
 * @apiDescription This is the Description.
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 * @apiSampleRequest /test
 * @apiGroup User
 * @apiHeader {String} access-key Users unique access-key.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Accept-Encoding": "Accept-Encoding: gzip, deflate"
 *     }
 * @apiIgnore Example comment
 * @apiParam {String} [firstname]  Optional Firstname of the User.
 * @apiParam {String} lastname     Mandatory Lastname.
 * @apiParam {String} country="DE" Mandatory with default value "DE".
 * @apiParam {Number} [age=18]     Optional Age with default 18.
 *
 * @apiParam (Login) {String} pass Only logged in users can post this.
 *                                 In generated documentation a separate
 *                                 "Login" Block will be generated.
 * @apiParam {Number} id Users unique ID.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id": 4711
 *     }
 * @apiPermission none
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {Object[]} profiles       List of user profiles.
 * @apiSuccess {Number}   profiles.age   Users age.
 * @apiSuccess {String}   profiles.image Avatar-Image.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */

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
if(process.argv[3] == "--mac"){
  var pool  = mysql.createPool({
    host     : config.dbhost,
    user     : config.dbuser,
    port     : config.port,
    password : 'root',
    database : config.dbname
  });
}else{
  var pool  = mysql.createPool({
    host     : config.dbhost,
    user     : config.dbuser,
    password : config.dbsecret,
    database : config.dbname
  });
}
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

/**
 * @api {get} / API Root
 * @apiName WonderfulCompany Welcome response
 * @apiGroup General
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       message: 'Benvenuto alle API della Web App "WonderfulCompany", effettua una richiesta valida :)'
 *     }
 *
 *
 *
 */

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany", effettua una richiesta valida :)'
    });
});

/**
* @api                {get} /authenticate                                       Authenticate
* @apiName            Authenticate
* @apiDescription     This is the request to get authentication token.
*
*
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 401    Unauthorized
*
*
* @apiSampleRequest   /authenticate
* @apiGroup           General
*
*
* @apiHeader          {String} Authorization                                    Basic authenticator "Basic [base-64 encoded string(email:password)]".
* @apiHeaderExample   {json} Header-Example:
*     {
*       "Authorization": "Basic eG1leTk1MkBjaWFvLml0Z2Y6Y2lhb2NpYW8="
*     }
* @apiPermission none
*
*
* @apiSuccess         {String} token                                            JWT Access Token.
* @apiSuccess         {Boolean} success                                         True if login is succesfully.
* @apiSuccess         {Object} user                                             User object.
* @apiSuccess         {String}   user.name                                      User name.
* @apiSuccess         {String}   user.surname                                   User surname.
* @apiSuccess         {String}   user.email                                     User email.
* @apiSuccessExample  {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*        "success": true,
*        "user": {
*           "name": "xmey952",
*           "surname": "xmey952",
*           "email": "xmey952@ciao.it"
*        },
*        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InhtZXk5NTJAY2lhby5pdCIsImlzc3VlX3RpbWUiOjE1Mjc3ODA3NzczMzksImlhdCI6MTUyNzc4MDc3NywiZXhwIjoxNTI4Mzg1NTc3fQ.2CvVNfk-eDnVKWkLjoB8bp1dmGPqgwUcL4_FkWTy_6c"
*     }
 */

//Authenticate an user who send valid log in credentials
router.route('/authenticate').get(auth.isAuthenticatedBasic, function(req,res) {
    var token = auth.generate_jwt_token(req.user.email);
    res.json({
        success: true,
        user: make_user_safe(req.user),
        token: token,
    });
});

/**
* @api                {post} /users                                             Add User
* @apiName            Add User
* @apiDescription     Creates a new user.
* @apiError           (Error 500) InternalServerError                           Creation failed.
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 500 Internal Server Error
*     {
*         success : false,
*         error : "Creation error"
*      }
* @apiSampleRequest   /users
* @apiGroup           General
* @apiParam           {String} name                                             Name of the User.
* @apiParam           {String} surname                                          Surname of the User.
* @apiParam           {String} email                                            Email of the User.
* @apiParam           {String} password                                         Password of the User.
* @apiParamExample    {json} Request-Example:
*     {
*       "name": "Paolino",
        "surname": "Paperino",
        "email": "paolino@disney.it",
        "password": "paolinopaperino"
*     }
* @apiPermission      none
* @apiSuccess         {Boolean} success                                         True if creation is succesfully.
* @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
* @apiSuccessExample  {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "success": true,
*       "error": null
*      }
*/

/**
* @api                {get} /users                                              Get Users
* @apiName            Get Users
* @apiDescription     Get the list of users.
* @apiError           (Error 500) InternalServerError                           Query failed.
* @apiError           (Error 404) NotFoundError                                 Resource not found.
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 500 Internal Server Error
*     {
*         success : false,
*         error : "INTERNAL_SERVER_ERROR"
*      }
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 404 Not Found Error
*     {
*         success : false,
*         error : "USERS_NOT_FOUND"
*      }
* @apiSampleRequest   /users
* @apiGroup           General
* @apiPermission      none
* @apiSuccess         {Boolean} success                                         True if the query is succesfully.
* @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
* @apiSuccess         {String} users                                            String containing list of users.
* @apiSuccessExample  {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "success": true,
*       "error": null,
*       "users": [
*                  {
*                   "name":"xmey952",
*                   "surname":"xmey952",
*                   "email":"xmey952@ciao.it"
*                  },
*                  {
*                   "name":"xmey95",
*                   "surname":"xmey95",
*                   "email":"xmey95@ciao.it"
*                  }
*                 ]
*      }
*/

//register a new user(POST)
router.route('/users').post(function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      var post  = {password: req.body.password, name: req.body.name, surname: req.body.surname, email: req.body.email};
      connection.query('INSERT INTO ?? SET ?', ['users', post], function (err, results, fields) {
        // And done with the connection.
        connection.release();

        if (err) return res.status(500).send(JSON.stringify({success:false, error:err}))
        else res.status(201).send(JSON.stringify({success:true, error:null}));
      });
    });
}).get(function(req, res){
  pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query('SELECT * FROM ??', ['users'], function (err, results, fields) {
      // And done with the connection.
      connection.release();

      if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
      if (!results) return res.status(404).send(JSON.stringify({success:false, error:"USERS_NOT_FOUND"}));

      var users = [];
      for(var i = 0; i < results.length; i++){
        users.push(make_user_safe(results[i]));
      }
      return res.status(200).send(JSON.stringify({success:true, error:null, users: users}));
    });
  });
});

/**
* @api                {get} /users/:user                                        Get User
* @apiName            Get User
* @apiDescription     Get User info by ID.
* @apiError           (Error 500) InternalServerError                           Query failed.
* @apiError           (Error 404) NotFoundError                                 Resource not found.
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 500 Internal Server Error
*     {
*         success : false,
*         error : "INTERNAL_SERVER_ERROR"
*      }
* @apiErrorExample    {json} Error-Response:
*     HTTP/1.1 404 Not Found Error
*     {
*         success : false,
*         error : "USER_NOT_FOUND"
*      }
* @apiSampleRequest   /user/1
* @apiGroup           General
* @apiPermission      none
* @apiSuccess         {Boolean} success                                         True if the query is succesfully.
* @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
* @apiSuccess         {String} user                                             String containing user object.
* @apiSuccessExample  {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "success": true,
*       "error": null,
*       "user":
*                  {
*                   "name":"xmey952",
*                   "surname":"xmey952",
*                   "email":"xmey952@ciao.it"
*                  },
*      }
*/

//Get a user(GET)
router.route('/users/:user').get(function(req, res) {
  pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query('SELECT * FROM ?? WHERE id = ?', ['users', req.params.user], function (err, results, fields) {
      // And done with the connection.
      connection.release();

      if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
      if (!results[0]) return res.status(404).send(JSON.stringify({success:false, error:"USER_NOT_FOUND"}));

      return res.status(200).send(JSON.stringify({success:true, error:null, user: make_user_safe(results[0])}));
    });
  });
});

//Set the manager for specified survey
router.route('/users/set_survey_manager/:user/:survey').post(auth.isAuthenticated, function(req, res) {

});

/**
 * @api {post} /users/set_boss/                                                 Set/Update boss
 * @apiName Set/Update boss
 * @apiDescription                                                              Set (or update if exists) the boss for specified user
 * @apiError           (Error 500) InternalServerError                          Submission failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup                                                                    General
 * @apiParam           {Number} user                                            Id of the Employee
 * @apiParam           {Number} boss                                            Id of the Boss
 * @apiParamExample    {json} Request-Example:
 *     {
 *         "user": 23,
 *         "boss": 6
 *     }
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *     }
 */
router.route('/users/set_boss/').post(auth.isAuthenticated, function(req, res) {
  if(req.user.superuser !=1) return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM ?? WHERE ?? = ?', ['supervisions', 'id_user', req.body.user], function (err, results, fields) {
          if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"USER_NOT_FOUND"}));
          if(results.length == 0){//l'utente non aveva un boss, inserimento nuova entry nella tabella supervisions
            var post  = {id_user: req.body.user, id_boss: req.body.boss};
            connection.query('INSERT INTO ?? SET ?', ['supervisions', post], function (err, results, fields) {
                connection.release();
                if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
                res.status(201).send(JSON.stringify({success:true, error:null}));
            });
          }else{  //cambio del boss, se già l'utente ne aveva uno
            connection.query('UPDATE ?? SET ?? = ? WHERE ?? = ?', ['supervisions', 'id_boss', req.body.boss, 'id_user', req.body.user], function (err, results, fields) {
                connection.release();
                if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
                res.status(201).send(JSON.stringify({success:true, error:null}));
            });
          }
      });
  });

});


/**
 * @api {get} /users/:user/get_boss/                                            Get Boss
 * @apiName                                                                     Get Boss
 * @apiDescription                                                              Get the id of specified user's Boss
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup General
 * @apiParam {String} user                                                      Id of the Employee
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {Number} boss                                                    Id of the specified user's boss
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "boss": 5
 *     }
 */
router.route('/users/:user/get_boss/').get(function(req, res) {
pool.getConnection(function(err, connection) {
    connection.query('SELECT ?? FROM ?? WHERE ?? = ?', ['id_boss', 'supervisions', 'id_user', req.params.user], function (err, results, fields) {
        connection.release();
        if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
        if (!results || results.length==0) return res.status(404).send(JSON.stringify({success:false, error:"BOSS_NOT_FOUND"}));
        res.status(201).send(JSON.stringify({success:true, error:null, boss: results[0].id_boss}));
    });
  });

});



/**
 * @api {get} /users/get_id_by_mail/                                            Get Id by Email
 * @apiName                                                                     Get Id by Email
 * @apiDescription                                                              Get the id the user who owns the specified email address
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiError           (Error 404) NotFoundError                                Request not found.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "USER_NOT_FOUND"
 *      }
 * @apiGroup General
 * @apiParam {String} email                                                     Email of the user to find
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {Number} user                                                    Id of the user
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "user": 14
 *     }
 */
router.route('/users/get_id_by_mail/').post(auth.isAuthenticated, function(req, res) {
pool.getConnection(function(err, connection) {
    connection.query('SELECT ?? FROM ?? WHERE ?? = ?', ['id', 'users', 'email', req.body.email], function (err, results, fields) {
        connection.release();
        if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
        if (!results || results.length==0) return res.status(404).send(JSON.stringify({success:false, error:"USER_NOT_FOUND"}));
        res.status(201).send(JSON.stringify({success:true, error:null, user: results[0].id}));
    });
  });

});

module.exports = router;
