var express = require('express');
var config = require('../config.js');
var auth = require('../auth.js');
var path = require('path');
var mysql = require('mysql');
var router = express.Router(); // new instance of express router
var crypto = require('crypto');

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

    pool.getConnection(function(err, connection) {
        // Use the connection
        var accessories = [];
        if(req.body.accessories)
            accessories = JSON.parse(req.body.accessories);
        

        var post  = {name: req.body.name, floor: req.body.floor, capacity: req.body.capacity};
        connection.query('INSERT INTO ?? SET ?', ['rooms', post], function (err, results, fields) {
        
            if (err) return res.status(500).send(JSON.stringify({success:false, error:err}))

            for(var i=0; i<accessories.length; i++){
                var post  = {id_room: results.insertId, id_accessory: accessories[i].id_accessory, quantity: accessories[i].quantity};
                connection.query('INSERT INTO ?? SET ?', ['accessoriesrooms', post], function (err, results, fields){
                    if(err) console.log(err);
                });
            }//end for
            connection.release();

            res.status(201).send(JSON.stringify({success:true, error:null}));
        });
      });

});

router.route('/rooms/:version').get(auth.isAuthenticated, function(req, res){
    
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query('SELECT * FROM ??', ['rooms'], function (err, results, fields) {
    
          if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
          if (!results) return res.status(404).send(JSON.stringify({success:false, error:"ROOMS_NOT_FOUND"}));
          var rooms = results;
           
            connection.query('SELECT * FROM ??', ['accessoriesrooms'], function (err, results, fields){


                connection.release();
                if (err) return res.status(500).send(JSON.stringify({success:false, error: err}));
                if (!results) return res.status(404).send(JSON.stringify({success:false, error:"ROOMS_NOT_FOUND"}));

                for(var i=0; i<rooms.length; i++){
                    rooms[i].accessories = [];
                    for(var j=0; j<results.length; j++){
                        if(results[j].id_room == rooms[i].id){
                            var object = {
                                "accessory": results[j].id_accessory,
                                "quantity": results[j].quantity,
                            }
                            rooms[i].accessories.push(object);
                        }
                    }
                }

                if(req.params.version=='false'){
                        return res.status(200).send(JSON.stringify({success:true, error:null, rooms: rooms}));
                }else{
                        var string = JSON.stringify(rooms);
                        string = crypto.createHash('sha1').update(string).digest('hex');
                        return res.status(200).send(JSON.stringify({success:true, error:null, version: string}));
                }   
            });
          
          
        });
      });

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
