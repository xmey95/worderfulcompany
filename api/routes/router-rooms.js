var express = require('express');
var config = require('../config.js');
var auth = require('../auth.js');
var path = require('path');
var mysql = require('mysql');
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
 * @apiGroup Rooms
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione aulario), effettua una richiesta valida :)'
 *     }
 */

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione aulario), effettua una richiesta valida :)'
    });
});

//Create a room or get all rooms(only superuser)
router.route('/rooms').post(auth.isAuthenticated, function(req, res){

}).get(auth.isAuthenticated, function(req, res){

});

//Get, modify or delete a room or get all rooms(only superuser)
router.route('/rooms/:room').put(auth.isAuthenticated, function(req, res){

}).delete(auth.isAuthenticated, function(req, res){

});

router.route('/rooms/:room/:version').get(auth.isAuthenticated, function(req, res){

});

//find rooms by filters passed by post parameters
router.route('/findrooms').post(auth.isAuthenticated, function(req, res){

});

//find bookings of requesting user
router.route('/bookings/:version').get(auth.isAuthenticated, function(req, res){

});

//find bookings for the specified room and submit a list of interval to booking
router.route('/bookings/:room/:version').get(auth.isAuthenticated, function(req, res){

});
router.route('/bookings/:room').post(auth.isAuthenticated, function(req, res){

});

//Delete specified booking(is requesting user is owner of the booking)
router.route('/bookings/:booking').delete(auth.isAuthenticated, function(req, res){

});



module.exports = router;
