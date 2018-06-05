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
 * @apiGroup Surveys
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione sondaggi), effettua una richiesta valida :)'
 *     }
 *
 *
 *
 */

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione sondaggi), effettua una richiesta valida :)'
    });
});

//Create an empty survey
router.route('/surveys').post(auth.isAuthenticated, function(req, res){

});

router.route('/surveys/:version').get(auth.isAuthenticated, function(req, res){

});

//Add or delete a step in specified survey or view specified survey
router.route('/surveys/:survey').post(auth.isAuthenticated, function(req, res){

}).delete(auth.isAuthenticated, function(req, res){

});

router.route('/surveys/:survey/:version').get(auth.isAuthenticated, function(req, res){

});

//Modify, get or delete question
router.route('/questions/:survey/:question').put(auth.isAuthenticated, function(req, res){

}).delete(auth.isAuthenticated, function(req, res){

});

router.route('/questions/:survey/:question/:version').get(auth.isAuthenticated, function(req, res){

})

//Submit a question
router.route('/answers/:survey/:question').post(auth.isAuthenticated, function(req, res){

});

//Modify, get or delete specific answer
router.route('/answers/:survey/:question/:answer').put(auth.isAuthenticated, function(req, res){

}).delete(auth.isAuthenticated, function(req, res){

});

router.route('/answers/:survey/:question/:answer/:version').get(auth.isAuthenticated, function(req, res){

})

//Get of details
router.route('/surveysdetails/:survey/:version').get(auth.isAuthenticated, function(req, res){

});

module.exports = router;
