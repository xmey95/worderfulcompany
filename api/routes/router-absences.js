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

function make_user_safe(user) {
  return {
    name: user.name,
    surname: user.surname,
    email: user.email
  }
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
          connection.release();
          if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUESTS_NOT_FOUND"}));
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

//upload justification file for a request
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
          var file_entry = "absences/requests/get_justification/" + newname;
          connection.query('UPDATE ?? SET ?? = ? WHERE ?? = ?', ['absences', 'justification_file', file_entry, 'id', req.params.request], function (err, results, fields) {
              if (err) {
                connection.release();
                return res.status(500).send(JSON.stringify({success:false, error:err}));
              }
              if (!results || results.length == 0) {
                connection.release();
                return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
              }

              if(req.user.id != results[0].id_user){ //if user is not the owner of the request the changes in the request are discarded
                connection.query('UPDATE ?? SET ?? = NULL WHERE ?? = ?', ['absences', 'justification_file', 'id', req.params.request], function (err, results, fields) {
                    connection.release();
                    if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
                    return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
                });
              }

              else{
                connection.release();
                return res.status(201).send(JSON.stringify({success:true, error:null}));
              }
          });
        });
    });
  });
});

//Get a justification file from the storage
router.route('/requests/get_justification/:file').get(auth.isAuthenticated, function(req,res){
    var path = config.media_path + '/justification_files/' + req.params.file;
    res.sendFile(path);
});


//approves a request(just for requests of employees of requesting user)
router.route('/requests/approve/:request').put(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT ?? FROM ??, ?? WHERE ?? = ??', ['supervisions.id_boss', 'absences', 'supervisions', 'absences.id_user', 'supervisions.id_user'], function (err, results, fields) {
        if (err) {
          connection.release();
          return res.status(500).send(JSON.stringify({success:false, error:err}));
        }
        if (!results) {
          connection.release();
          return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
        }
        if(results.length == 0) {
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        var flag = false;
        for(var j=0;j<results.length;j++){
           if(results[j].id_boss == req.user.id) flag = true;
        }
        if (flag ==false){
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        connection.query('SELECT ?? FROM ?? WHERE ?? = ?', ['state', 'absences', 'id', req.params.request], function (err, results, fields) {
            if (err) {
              connection.release();
              return res.status(500).send(JSON.stringify({success:false, error:err}));
            }
            if (!results || results.length == 0) {
              connection.release();
              return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
            }
            if(results[0].state != 0){
              connection.release();
              return res.status(400).send(JSON.stringify({success:false, error:"REQUEST_NOT_PENDING"}));
            }
            connection.query('UPDATE ?? SET ?? = ? WHERE ?? = ?', ['absences', 'state', 1, 'id', req.params.request], function (err, results, fields) {
                connection.release();
                if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
                if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
                res.status(201).send(JSON.stringify({success:true, error:null}));
            });
        });
      });
    });
});

//refuse a request(just for requests of employees of requesting user)
router.route('/requests/refuse/:request').put(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT ?? FROM ??, ?? WHERE ?? = ??', ['supervisions.id_boss', 'absences', 'supervisions', 'absences.id_user', 'supervisions.id_user'], function (err, results, fields) {
        if (err) {
          connection.release();
          return res.status(500).send(JSON.stringify({success:false, error:err}));
        }
        if (!results) {
          connection.release();
          return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
        }
        if(results.length == 0) {
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        var flag = false;
        for(var j=0;j<results.length;j++){
           if(results[j].id_boss == req.user.id) flag = true;
        }
        if (flag ==false){
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        connection.query('SELECT ?? FROM ?? WHERE ?? = ?', ['state', 'absences', 'id', req.params.request], function (err, results, fields) {
            if (err) {
              connection.release();
              return res.status(500).send(JSON.stringify({success:false, error:err}));
            }
            if (!results || results.length == 0){
              connection.release();
              return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
            }
            if(results[0].state != 0){
              connection.release();
              return res.status(400).send(JSON.stringify({success:false, error:"REQUEST_NOT_PENDING"}));
            }
            connection.query('UPDATE ?? SET ?? = ? WHERE ?? = ?', ['absences', 'state', 2, 'id', req.params.request], function (err, results, fields) {
                connection.release();
                if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
                if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
                res.status(201).send(JSON.stringify({success:true, error:null}));
            });
        });
      });
    });
});

//modify(delete) a request (only for the creator of the request)
router.route('/requests/:request').put(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM ?? WHERE ?? = ?', ['absences', 'id', req.params.request], function (err, results, fields) {
        if (err) {
          connection.release();
          return res.status(500).send(JSON.stringify({success:false, error:err}));
        }
        if (!results || results.length == 0) {
          connection.release();
          return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
        }
        if(results[0].state != 0){
          connection.release();
          return res.status(400).send(JSON.stringify({success:false, error:"REQUEST_NOT_PENDING"}));
        }
        if(results[0].id_user != req.user.id){
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        var reason = results[0].reason;
        var start_date = results[0].start_date;
        var end_date = results[0].end_date;

        if(req.body.reason){
          reason = req.body.reason;
        }

        if(req.body.start_date){
          start_date = req.body.start_date;
        }

        if(req.body.end_date){
          end_date = req.body.end_date;
        }

        connection.query('UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?', ['absences', 'reason', reason, 'start_date', start_date, 'end_date', end_date, 'id', req.params.request], function (err, results, fields) {
            connection.release();
            if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
            if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
            res.status(201).send(JSON.stringify({success:true, error:null}));
        });
    });
  });
}).delete(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM ?? WHERE ?? = ?', ['absences', 'id', req.params.request], function (err, results, fields) {
        if (err) {
          connection.release();
          return res.status(500).send(JSON.stringify({success:false, error:err}));
        }

        if (!results || results.length == 0){
          connection.release();
          return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
        }
        if(results[0].state != 0){
          connection.release();
          return res.status(400).send(JSON.stringify({success:false, error:"REQUEST_NOT_PENDING"}));
        }
        if(results[0].id_user != req.user.id){
          connection.release();
          return res.status(401).send(JSON.stringify({success:false, error:"UNAUTHORIZED"}));
        }
        connection.query('DELETE FROM ?? WHERE ?? = ?', ['absences', 'id', req.params.request], function (err, results, fields) {
            connection.release();
            if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
            res.status(201).send(JSON.stringify({success:true, error:null}));
        });
    });
  });
});

//get info of the specified request
router.route('/requests/:request/:version').get(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM ?? WHERE ?? = ?', ['absences', 'id', req.params.request], function (err, results, fields) {
        connection.release();
        if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
        if (!results || results.length == 0) return res.status(404).send(JSON.stringify({success:false, error:"REQUEST_NOT_FOUND"}));
        if(req.params.version=='false'){
                return res.status(201).send(JSON.stringify({success:true, error:null, request: results[0]}));
        }else{
                var string = JSON.stringify(results);
                string = crypto.createHash('sha1').update(string).digest('hex');
                return res.status(201).send(JSON.stringify({success:true, error:null, version: string}));
        }
    });
  });
});

//get requesting user's employees information
router.route('/employees/:version').get(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM ??,?? WHERE ?? = ?? AND ??=?', ['users', 'supervisions', 'supervisions.id_user', 'users.id', 'supervisions.id_boss', req.user.id], function (err, results, fields) {
        connection.release();
        if (err) return res.status(500).send(JSON.stringify({success:false, error:err}));
        if (!results) return res.status(404).send(JSON.stringify({success:false, error:"RESOURCE_NOT_FOUND"}));
        var array = [];
        for(var i=0; i< results.length;i++){
          array.push(make_user_safe(results[i]));
        }
        if(req.params.version=='false'){
                return res.status(201).send(JSON.stringify({success:true, error:null, users: array}));
        }else{
                var string = JSON.stringify(array);
                string = crypto.createHash('sha1').update(string).digest('hex');
                return res.status(201).send(JSON.stringify({success:true, error:null, version: string}));
        }
    });
  });
});


//get info of the specified user's requests (if requesting user is his boss)
router.route('/employees/requests/:employee/:version').get(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM ??,?? WHERE ?? = ?? AND ??=? AND ??=?', ['absences','supervisions', 'supervisions.id_user', 'absences.id_user', 'supervisions.id_boss', req.user.id, 'absences.id_user', req.params.employee], function (err, results, fields) {
          connection.release();
          if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUESTS_NOT_FOUND"}));
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

//get all request made by requesting user's employees
router.route('/employees/requests/:version').get(auth.isAuthenticated, function(req, res){
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM ??,?? WHERE ?? = ?? AND ??=?', ['absences','supervisions', 'supervisions.id_user', 'absences.id_user', 'supervisions.id_boss', req.user.id], function (err, results, fields) {
          connection.release();
          if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"REQUESTS_NOT_FOUND"}));
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


module.exports = router;
