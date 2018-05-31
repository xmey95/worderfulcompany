var path = require('path');
var express = require('express');
var mysql = require('mysql');
var config = require('../config.js');
var router = express.Router(); // new instance of express router

//MySQL Connection
var pool  = mysql.createPool({
  host     : config.dbhost,
  user     : config.dbuser,
  password : config.dbsecret,
  database : config.dbname
});

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

module.exports = router;
