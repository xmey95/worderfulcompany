var path = require('path');
var express = require('express');
var mysql = require('mysql');
var auth = require('../auth.js');
var config = require('../config.js');
var router = express.Router(); // new instance of express router
var crypto = require('crypto');
var formidable = require('formidable');  //module to save uploaded file (justifications)
var fs = require('fs');

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


//create a new request for an absence
router.route('/requests').post(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
      var post  = {state : 0, reason: req.body.reason, start_date:req.body.start_date, end_date: req.body.end_date, id_user: req.user.id};
      connection.query('INSERT INTO ?? SET ?', ['absences', post], function (err, results, fields) {
          connection.release();
          if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
          res.status(201).send(JSON.stringify({success:true, error:null}));
      });
    });

});

//get all absence (approved and not approved) of the requesting user
router.route('/requests/:version').get(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
      // Use the connection to select requests from database
      connection.query('SELECT * FROM ?? WHERE ?? = ?', ['absences', 'id_user', req.user.id], function (err, results, fields) {
          if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUESTS_NOT_FOUND"}));
          connection.release();
          if(req.params.version=='false'){
                  return res.status(201).send(JSON.stringify({success:true, error:null, requests: results}));
          }else{
                  var string = JSON.stringify(results);
                  string = crypto.createHash('sha1').update(string).digest('hex');
                  return res.status(201).send(JSON.stringify({success:true, error:null, version: string}));
          }
      });
    });
});

//upload justification file for a request (only for the creator of the request)
router.route('/requests/:request/upload_justification').put(auth.isAuthenticated, function(req, res){
  var form = new formidable.IncomingForm();
form.parse(req, function (err, fields, files) {
  var oldpath = files.filetoupload.path;
  var parts = files.filetoupload.name.split('.');
  var filext = '.' + parts[parts.length-1];
  var newname = req.params.request + filext;
  var newpath =  config.media_path +'justification_files/' + newname;
  console.log(newpath);
  fs.rename(oldpath, newpath, function (err) {
    if (err) throw err;
    pool.getConnection(function(err, connection) {
        // Use the connection
        var post  = {name: req.body.name, id_user: req.user.id};
        connection.query('UPDATE ?? SET ?? = ? WHERE ?? = ?', ['absences', 'justification_file', newpath, 'id', req.params.request], function (err, results, fields) {
            connection.release();
            if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
            if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
            res.status(201).send(JSON.stringify({success:true, error:null}));

        });
      });
  });
});

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
