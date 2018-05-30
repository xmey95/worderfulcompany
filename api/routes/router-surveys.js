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

router.get('/', function(req, res){
    res.json({
        message: 'Benvenuto alle API della Web App "WonderfulCompany"(sezione sondaggi), effettua una richiesta valida :)'
    });
});

module.exports = router;
