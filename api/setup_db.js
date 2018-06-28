var mysql = require('mysql');
var config = require('./config.js');

var setup_db = () => {
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
console.log("Starting DB Setup...")

var users = 'CREATE TABLE if not exists users (id integer primary key AUTO_INCREMENT, password text not null, name text not null, surname text not null, email text not null, superuser boolean not null default false)'

var absence = 'CREATE TABLE if not exists absences (id integer primary key AUTO_INCREMENT, id_user integer not null, state integer not null, reason text not null, justification_file text, start_date date, end_date date, foreign key(id_user) references users(id))'

var room = 'CREATE TABLE if not exists rooms (id integer primary key AUTO_INCREMENT, name text not null, floor text not null, capacity text not null)'

var accessory = 'CREATE TABLE if not exists accessories (id integer primary key AUTO_INCREMENT, name text not null, description text not null)'

var survey = 'CREATE TABLE if not exists surveys (id integer primary key AUTO_INCREMENT, name text not null, id_user integer not null, foreign key(id_user) references users(id))'

var question = 'CREATE TABLE if not exists questions (id integer primary key AUTO_INCREMENT, question text not null, answer text, type text not null, step integer not null, condition_answer text not null, id_survey integer not null, foreign key(id_survey) references surveys(id) ON DELETE CASCADE)'

var answer = 'CREATE TABLE if not exists answers (id integer primary key AUTO_INCREMENT, id_question integer not null, id_user integer not null, answer text not null, foreign key(id_user) references users(id) ON DELETE CASCADE, foreign key(id_question) references questions(id) ON DELETE CASCADE)'

var condition = 'CREATE TABLE if not exists conditions (id integer primary key AUTO_INCREMENT, answer text not null, id_p_question integer not null, id_question integer not null, foreign key(id_p_question) references questions(id) ON DELETE CASCADE, foreign key(id_question) references questions(id) ON DELETE CASCADE)'

var supervision = 'CREATE TABLE if not exists supervisions (id_user integer not null, id_boss integer not null, foreign key(id_user) references users(id), foreign key(id_boss) references users(id))'

var accessoryroom = 'CREATE TABLE if not exists accessoriesrooms (id_room integer not null, id_accessory integer not null, quantity integer not null, foreign key(id_room) references rooms(id) ON DELETE CASCADE, foreign key(id_accessory) references accessories(id))'

var booking = 'CREATE TABLE if not exists bookings (id integer primary key AUTO_INCREMENT, start_date date, end_date date, id_room integer not null, id_user integer not null, foreign key(id_room) references rooms(id), foreign key(id_user) references users(id))'

pool.getConnection(function(err, connection) {
  // Use the connection
  connection.query(users, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(absence, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(room, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(accessory, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(survey, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(question, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(answer, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(condition, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(supervision, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(accessoryroom, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.query(booking, null, function (err, results, fields) {
    if (err) console.log(err.code);
  });
  connection.release();
});
}

exports.setupDB = setup_db;
