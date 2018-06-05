var path = require('path');
var express = require('express');
var mysql = require('mysql');
var auth = require('../auth.js');
var config = require('../config.js');
var router = express.Router(); // new instance of express router

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
/**
 * @api {get} / Section Welcome response
 * @apiName Section Welcome response
 * @apiGroup Absences
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione assenze), effettua una richiesta valida :)'
 *     }
 *
 *
 *
 */

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione assenze), effettua una richiesta valida :)'
    });
});

//get all requests of requesting user
router.route('/requests').post(auth.isAuthenticated, function(req, res){

});

//version for previouse request
router.route('/requests/:version').get(auth.isAuthenticated, function(req, res){

});

//approves a request(just for requests of employees of requesting user)
router.route('/requests/approve/:request').put(auth.isAuthenticated, function(req, res){

});

//modify(delete) a request (only for the creator of the request)
router.route('/requests/:request').put(auth.isAuthenticated, function(req, res){

}).delete(auth.isAuthenticated, function(req, res){

});

//get info of the specified request
router.route('/requests/:request/:version').get(auth.isAuthenticated, function(req, res){

});

//get requesting user's employees information
router.route('/employees/:version').get(auth.isAuthenticated, function(req, res){

});

//get all request made by requesting user's employees
router.route('/employees/requests/:version').get(auth.isAuthenticated, function(req, res){

});

//get info of the specified user's requests
router.route('/employees/requests/:employee/:version').get(auth.isAuthenticated, function(req, res){

});

module.exports = router;
