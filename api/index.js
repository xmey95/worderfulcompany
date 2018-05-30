var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
var session = require('express-session');
var passport = require('passport');

//Include routes for every part of the project
var router_absences = require('./routes/router-absences.js');
var router_surveys = require('./routes/router-surveys.js');
var router_rooms = require('./routes/router-rooms.js');
var router = require('./routes/router.js');
var config = require('./config.js');

var SECRET = config.secret;

var app = express(); // create express app

// set the secret to the app
app.set('superSecret', SECRET);

// tell app to use bodyParser
// this will enable us to parse the POST data
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(session({
    secret: config.secret
}
));

// use morgan to log requests to the console
// when in production, redirect the log to the log server
app.use(morgan('dev'));

// use passport for authentication
app.use(passport.initialize());

var port = process.env.PORT || 8080;

// a middleware with no mount path; gets executed for every request to the app
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type, accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
  res.header('Access-Control-Max-Age', '1728000');
  next();
});
// router in separate file
// tell the server to answer to addresses starting with /api/v1 with the router definitions (see ./router.js)
app.use('/api/surveys', router_surveys);
app.use('/api/absences', router_absences);
app.use('/api/rooms', router_rooms);
app.use('/api/', router);

app.listen(port);
console.log('Express server active on port ' + port);
