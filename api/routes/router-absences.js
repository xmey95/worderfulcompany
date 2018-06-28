var path = require("path");
var express = require("express");
var mysql = require("mysql");
var auth = require("../auth.js");
var config = require("../config.js");
var router = express.Router(); // new instance of express router
var crypto = require("crypto");
var formidable = require("formidable"); //module to save uploaded file (justifications)
var fs = require("fs");
var nodemailer = require("nodemailer");

//MySQL Connection
if (process.argv[3] == "--mac") {
  var pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    port: config.port,
    password: "root",
    database: config.dbname
  });
} else {
  var pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbsecret,
    database: config.dbname
  });
}

function make_user_safe(user) {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email
  };
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

router.get("/", function(req, res) {
  res.json({
    message:
      'Benvenuto alle API della Web App "WonderfulCompany"(sezione assenze), effettua una richiesta valida :)'
  });
});

/**
 * @api {post} /requests                                                         My Requests
 * @apiName My Requests
 * @apiDescription                                                              Submit a new absence request
 * @apiError           (Error 500) InternalServerError                          Submission failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam           {String} reason                                          Reason of the absence
 * @apiParam           {Date} start_date                                        Initial date of the absence
 * @apiParam           {Date} end_date                                          Final date of the absence (included)
 * @apiParamExample    {json} Request-Example:
 *     {
 *         "reason": "Malattia",
 *         "stard_date": "2018-08-08",
 *         "end_date": "2018-08-09"
 *     }
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} request_id                                              The id of the submitted Request
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null,
 *       "request_id": 95,
 *     }
 */
router.route("/requests").post(auth.isAuthenticated, function(req, res) {
  pool.getConnection(function(err, connection) {
    console.log(req.body.start_date);
    var post = {
      state: 0,
      reason: req.body.reason,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      id_user: req.user.id
    };
    connection.query("INSERT INTO ?? SET ?", ["absences", post], function(
      err,
      results,
      fields
    ) {
      connection.release();
      if (err)
        return res
          .status(500)
          .send(JSON.stringify({ success: false, error: err }));
      res
        .status(201)
        .send(
          JSON.stringify({
            success: true,
            error: null,
            request_id: results.insertId
          })
        );
    });
  });
});

/**
 * @api {get} /requests/:version                                                Absence Requests
 * @apiName Absence Requests
 * @apiDescription Get the list of all the absence in company
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} requests                                                String containing the stringified list of requests
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "requests": [
 *                {  "id":4,
 *                   "id_user":1,
 *                   "state":0,
 *                   "reason":"febbre",
 *                   "justification_file":"absences/requests/get_justification/4.png",
 *                   "start_date":"2018-09-06T22:00:00.000Z",
 *                   "end_date":"2018-09-08T22:00:00.000Z"
 *                  }]
 *     }
 */

router
  .route("/requests/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection to select requests from database
      connection.query("SELECT * FROM ??", ["absences"], function(
        err,
        results,
        fields
      ) {
        connection.release();
        if (err)
          return res
            .status(500)
            .send(JSON.stringify({ success: false, error: err }));
        if (!results)
          return res
            .status(404)
            .send(
              JSON.stringify({ success: false, error: "REQUESTS_NOT_FOUND" })
            );
        if (req.params.version == "false") {
          return res
            .status(201)
            .send(
              JSON.stringify({ success: true, error: null, requests: results })
            );
        } else {
          var string = JSON.stringify(results);
          string = crypto
            .createHash("sha1")
            .update(string)
            .digest("hex");
          return res
            .status(201)
            .send(
              JSON.stringify({ success: true, error: null, version: string })
            );
        }
      });
    });
  });

/**
 * @api {get} /myrequests/:version                                                My Requests
 * @apiName My Requests
 * @apiDescription Get the list of the absence requests made by the requesting user
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} requests                                                String containing the stringified list of requests
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "requests": [
 *                {  "id":4,
 *                   "id_user":1,
 *                   "state":0,
 *                   "reason":"febbre",
 *                   "justification_file":"absences/requests/get_justification/4.png",
 *                   "start_date":"2018-09-06T22:00:00.000Z",
 *                   "end_date":"2018-09-08T22:00:00.000Z"
 *                  }]
 *     }
 */
router
  .route("/myrequests/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection to select requests from database
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["absences", "id_user", req.user.id],
        function(err, results, fields) {
          connection.release();
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUESTS_NOT_FOUND" })
              );
          if (req.params.version == "false") {
            return res
              .status(201)
              .send(
                JSON.stringify({
                  success: true,
                  error: null,
                  requests: results
                })
              );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

/**
 * @api                {put} /requests/:request/upload_justification             Upload Justification
 * @apiName            Upload Justification
 * @apiDescription     Upload Justification file for specified request
 * @apiError           (Error 500) InternalServerError                           Query failed.
 * @apiError           (Error 404) NotFoundError                                 Resource not found.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUESTS_NOT_FOUND"
 *      }
 * @apiParam {Number} request                                                    The id of the request
 * @apiHeader {String} Authorization                                             Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiGroup           Absences
 * @apiSuccess         {Boolean} success                                         True if the query is succesfully.
 * @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
 * @apiSuccessExample  {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *      }
 */
router
  .route("/requests/:request/upload_justification")
  .put(auth.isAuthenticated, function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var oldpath = files.filetoupload.path;
      var parts = files.filetoupload.name.split(".");
      var filext = "." + parts[parts.length - 1];
      var newname = req.params.request + filext;
      var newpath = config.media_path + "justification_files/" + newname;
      console.log(newpath);
      fs.rename(oldpath, newpath, function(err) {
        if (err) throw err;
        pool.getConnection(function(err, connection) {
          var file_entry = "absences/requests/get_justification/" + newname;
          connection.query(
            "UPDATE ?? SET ?? = ? WHERE ?? = ?",
            [
              "absences",
              "justification_file",
              file_entry,
              "id",
              req.params.request
            ],
            function(err, results, fields) {
              if (err) {
                connection.release();
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              }
              console.log(JSON.stringify(results));
              if (!results || results.affectedRows == 0) {
                connection.release();
                return res
                  .status(404)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_FOUND"
                    })
                  );
              }
              connection.release();
              return res
                .status(201)
                .send(JSON.stringify({ success: true, error: null }));
            }
          );
        });
      });
    });
  });

/**
 * @api                {get} /requests/get_justification/:file                   Get a justification file from the storage
 * @apiName            Get Justification
 * @apiDescription     Get Justification file identified by filename
 * @apiError           (Error 404) NotFoundError                                 Resource not found
 * @apiGroup           Absences
 * @apiParam {String} file                                                       Filename of the JUstification file, it's like <id_absence>.<extension>
 * @apiSuccess         {File} file                                               Requested file
 */
router.route("/requests/get_justification/:file").get(function(req, res) {
  var path = config.media_path + "/justification_files/" + req.params.file;
  res.sendFile(path);
});

/**
 * @api                {get} /requests/get_justification/:file/download          Download a justification file from the storage
 * @apiName            Download Justification
 * @apiDescription     Donwload Justification file identified by filename
 * @apiError           (Error 404) NotFoundError                                 Resource not found
 * @apiGroup           Absences
 * @apiParam {String} file                                                       Filename of the Justification file, it's like <id_absence>.<extension>
 * @apiSuccess         {File} file                                               Requested file
 */
router
  .route("/requests/get_justification/:file/download")
  .get(function(req, res) {
    var path = config.media_path + "/justification_files/" + req.params.file;
    res.download(path); // Send requested file for donwload
  });

/**
 * @api                {put} /requests/approve/:request                         Approve Request
 * @apiName            Approve Request
 * @apiDescription     Approve an absence request made by an Employee of the requesting user and send a notification email to the employee
 * @apiGroup           Absences
 * @apiError           (Error 500) InternalServerError                          Operation failed.
 * @apiError           (Error 404) NotFoundError                                Request not found.
 * @apiError           (Error 401) Unauthorized                                 The user is not the boss of the request's owner
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         success : false,
 *         error : "UNAUTHORIZED"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_FOUND"
 *      }
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiParam {Number} request                                                   The id of the request.
 * @apiSuccess         {Boolean} success                                         True if the query is succesfully.
 * @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
 * @apiSuccessExample  {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *      }
 */
router
  .route("/requests/approve/:request")
  .put(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT ?? FROM ??, ?? WHERE ?? = ??",
        [
          "supervisions.id_boss",
          "absences",
          "supervisions",
          "absences.id_user",
          "supervisions.id_user"
        ],
        function(err, results, fields) {
          if (err) {
            connection.release();
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          }
          if (!results) {
            connection.release();
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_FOUND" })
              );
          }
          if (results.length == 0) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          var flag = false;
          for (var j = 0; j < results.length; j++) {
            if (results[j].id_boss == req.user.id) flag = true;
          }
          if (flag == false) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          connection.query(
            "SELECT ?? FROM ?? WHERE ?? = ?",
            ["state", "absences", "id", req.params.request],
            function(err, results, fields) {
              if (err) {
                connection.release();
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              }
              if (!results || results.length == 0) {
                connection.release();
                return res
                  .status(404)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_FOUND"
                    })
                  );
              }
              if (results[0].state != 0) {
                connection.release();
                return res
                  .status(400)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_PENDING"
                    })
                  );
              }
              connection.query(
                "UPDATE ?? SET ?? = ? WHERE ?? = ?",
                ["absences", "state", 1, "id", req.params.request],
                function(err, results, fields) {
                  if (err)
                    return res
                      .status(500)
                      .send(JSON.stringify({ success: false, error: err }));
                  if (!results)
                    return res
                      .status(404)
                      .send(
                        JSON.stringify({
                          success: false,
                          error: "REQUEST_NOT_FOUND"
                        })
                      );

                  connection.query(
                    "SELECT * FROM ??,?? WHERE ?? = ?? AND ?? = ?",
                    [
                      "users",
                      "absences",
                      "users.id",
                      "absences.id_user",
                      "absences.id",
                      req.params.request
                    ],
                    function(err, results, fields) {
                      connection.release();
                      if (err)
                        return res
                          .status(500)
                          .send(JSON.stringify({ success: false, error: err }));
                      if (!results || !results[0])
                        return res
                          .status(404)
                          .send(
                            JSON.stringify({
                              success: false,
                              error: "USER_NOT_FOUND"
                            })
                          );

                      var transporter = nodemailer.createTransport({
                        host: config.mailhost,
                        port: config.mailport,
                        secureConnection: config.mailsecureConnection,
                        service: config.email_service,
                        auth: {
                          user: config.email,
                          pass: config.pass_email
                        }
                      });
                      var mailOptions = {
                        from: config.email,
                        to: results[0].email,
                        subject:
                          "Wonderful Company: Aggiornamento richiesta #" +
                          req.params.request,
                        text:
                          "Gentile " +
                          results[0].name +
                          " " +
                          results[0].surname +
                          ",\nTi avvisiamo che la tua richiesta di assenza numero " +
                          req.params.request +
                          " è stata approvata.\n\n Saluti da WonderfulCompany"
                      };
                      transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log("Email sent: " + info.response);
                          res
                            .status(201)
                            .send(
                              JSON.stringify({ success: true, error: null })
                            );
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });

/**
 * @api                {put} /requests/refuse/:request                          Refuse Request
 * @apiName            Refuse Request
 * @apiDescription     Refuse an absence request made by an Employee of the requesting user and send a notification email to the employee
 * @apiGroup           Absences
 * @apiError           (Error 500) InternalServerError                          Operation failed.
 * @apiError           (Error 404) NotFoundError                                Request not found.
 * @apiError           (Error 401) Unauthorized                                 The user is not the boss of the request's owner
 * @apiError           (Error 400) BadRequest                                   The request's state is not pending
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_PENDING"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         success : false,
 *         error : "UNAUTHORIZED"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_FOUND"
 *      }
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiParam {Number} request                                                   The id of the request.
 * @apiSuccess         {Boolean} success                                         True if the query is succesfully.
 * @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
 * @apiSuccessExample  {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *      }
 */
router
  .route("/requests/refuse/:request")
  .put(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT ?? FROM ??, ?? WHERE ?? = ??",
        [
          "supervisions.id_boss",
          "absences",
          "supervisions",
          "absences.id_user",
          "supervisions.id_user"
        ],
        function(err, results, fields) {
          if (err) {
            connection.release();
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          }
          if (!results) {
            connection.release();
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_FOUND" })
              );
          }
          if (results.length == 0) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          var flag = false;
          for (var j = 0; j < results.length; j++) {
            if (results[j].id_boss == req.user.id) flag = true;
          }
          if (flag == false) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          connection.query(
            "SELECT ?? FROM ?? WHERE ?? = ?",
            ["state", "absences", "id", req.params.request],
            function(err, results, fields) {
              if (err) {
                connection.release();
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              }
              if (!results || results.length == 0) {
                connection.release();
                return res
                  .status(404)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_FOUND"
                    })
                  );
              }
              if (results[0].state != 0) {
                connection.release();
                return res
                  .status(400)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_PENDING"
                    })
                  );
              }
              connection.query(
                "UPDATE ?? SET ?? = ? WHERE ?? = ?",
                ["absences", "state", 2, "id", req.params.request],
                function(err, results, fields) {
                  if (err)
                    return res
                      .status(500)
                      .send(JSON.stringify({ success: false, error: err }));
                  if (!results)
                    return res
                      .status(404)
                      .send(
                        JSON.stringify({
                          success: false,
                          error: "REQUEST_NOT_FOUND"
                        })
                      );
                  connection.query(
                    "SELECT * FROM ??,?? WHERE ?? = ?? AND ?? = ?",
                    [
                      "users",
                      "absences",
                      "users.id",
                      "absences.id_user",
                      "absences.id",
                      req.params.request
                    ],
                    function(err, results, fields) {
                      connection.release();
                      if (err)
                        return res
                          .status(500)
                          .send(JSON.stringify({ success: false, error: err }));
                      if (!results || !results[0])
                        return res
                          .status(404)
                          .send(
                            JSON.stringify({
                              success: false,
                              error: "USER_NOT_FOUND"
                            })
                          );
                      var transporter = nodemailer.createTransport({
                        host: config.mailhost,
                        port: config.mailport,
                        secureConnection: config.mailsecureConnection,
                        service: config.email_service,
                        auth: {
                          user: config.email,
                          pass: config.pass_email
                        }
                      });
                      var mailOptions = {
                        from: config.email,
                        to: results[0].email,
                        subject:
                          "Wonderful Company: Aggiornamento richiesta #" +
                          req.params.request,
                        text:
                          "Gentile " +
                          results[0].name +
                          " " +
                          results[0].surname +
                          ",\nSiamo spiacenti di informarti che la tua richiesta di assenza numero " +
                          req.params.request +
                          " è stata rifiutata.\n\n Saluti da WonderfulCompany"
                      };
                      transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log("Email sent: " + info.response);
                          res
                            .status(201)
                            .send(
                              JSON.stringify({ success: true, error: null })
                            );
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });

/**
 * @api                {put} /requests/:request                                 Modify Request
 * @apiName            Modify Request
 * @apiDescription     Modify an absence request made by the requesting user
 * @apiGroup           Absences
 * @apiError           (Error 500) InternalServerError                          Operation failed.
 * @apiError           (Error 404) NotFoundError                                Request not found.
 * @apiError           (Error 401) Unauthorized                                 The user is not the request's owner
 * @apiError           (Error 400) BadRequest                                   The request's state is not pending
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_PENDING"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         success : false,
 *         error : "UNAUTHORIZED"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_FOUND"
 *      }
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiParam           {String} reason                                          Optional Reason of the absence
 * @apiParam           {Date} start_date                                        Optional Initial date of the absence
 * @apiParam           {Date} end_date                                          Optional Final date of the absence (included)
 * @apiParamExample    {json} Request-Example:
 *     {
 *       "reason": "Malattia",
 *       "end_date": "2018-08-09"
 *     }
 *
 *
 *
 * @apiParam {Number} request                                                   The id of the request.
 * @apiSuccess         {Boolean} success                                         True if the query is succesfully.
 * @apiSuccess         {String} error                                            String containing the error, it's null if success is true.
 * @apiSuccessExample  {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *      }
 */

/**
 * @api                {delete} /requests/:request                             Delete Request
 * @apiName            Delete Request
 * @apiDescription     Delete an absence request made by the requesting user
 * @apiGroup           Absences
 * @apiError           (Error 500) InternalServerError                         Operation failed.
 * @apiError           (Error 404) NotFoundError                               Request not found.
 * @apiError           (Error 401) Unauthorized                                The user is not the request's owner
 * @apiError           (Error 400) BadRequest                                  The request's state is not pending
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_PENDING"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         success : false,
 *         error : "UNAUTHORIZED"
 *      }
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_FOUND"
 *      }
 * @apiHeader {String} Authorization                                           Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 *
 *
 * @apiParam {Number} request                                                  The id of the request to delete
 * @apiSuccess         {Boolean} success                                       True if the deletion is succesfully.
 * @apiSuccess         {String} error                                          String containing the error, it's null if success is true.
 * @apiSuccessExample  {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *      }
 */

router
  .route("/requests/:request")
  .put(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["absences", "id", req.params.request],
        function(err, results, fields) {
          if (err) {
            connection.release();
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          }
          if (!results || results.length == 0) {
            connection.release();
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_FOUND" })
              );
          }
          if (results[0].state != 0) {
            connection.release();
            return res
              .status(400)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_PENDING" })
              );
          }
          if (results[0].id_user != req.user.id) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          var reason = results[0].reason;
          var start_date = results[0].start_date;
          var end_date = results[0].end_date;

          if (req.body.reason) {
            reason = req.body.reason;
          }

          if (req.body.start_date) {
            start_date = req.body.start_date;
          }

          if (req.body.end_date) {
            end_date = req.body.end_date;
          }

          connection.query(
            "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?",
            [
              "absences",
              "reason",
              reason,
              "start_date",
              start_date,
              "end_date",
              end_date,
              "id",
              req.params.request
            ],
            function(err, results, fields) {
              connection.release();
              if (err)
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              if (!results)
                return res
                  .status(404)
                  .send(
                    JSON.stringify({
                      success: false,
                      error: "REQUEST_NOT_FOUND"
                    })
                  );
              res
                .status(201)
                .send(JSON.stringify({ success: true, error: null }));
            }
          );
        }
      );
    });
  })
  .delete(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["absences", "id", req.params.request],
        function(err, results, fields) {
          if (err) {
            connection.release();
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          }

          if (!results || results.length == 0) {
            connection.release();
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_FOUND" })
              );
          }
          if (results[0].state != 0) {
            connection.release();
            return res
              .status(400)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_PENDING" })
              );
          }
          if (results[0].id_user != req.user.id) {
            connection.release();
            return res
              .status(401)
              .send(JSON.stringify({ success: false, error: "UNAUTHORIZED" }));
          }
          connection.query(
            "DELETE FROM ?? WHERE ?? = ?",
            ["absences", "id", req.params.request],
            function(err, results, fields) {
              connection.release();
              if (err)
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              res
                .status(201)
                .send(JSON.stringify({ success: true, error: null }));
            }
          );
        }
      );
    });
  });

/**
 * @api {get} /requests/:request/:version                                       Get Request
 * @apiName   Get Requests
 * @apiDescription Get info of the specified absence request
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiError           (Error 404) NotFoundError                                Request not found.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 404 Not Found Error
 *     {
 *         success : false,
 *         error : "REQUEST_NOT_FOUND"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiParam {Number} request                                                   Id of the request to get
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} request                                                 String containing the stringified request object
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "request":
 *                {  "id":4,
 *                   "id_user":1,
 *                   "state":0,
 *                   "reason":"Malattia",
 *                   "justification_file":"absences/requests/get_justification/4.png",
 *                   "start_date":"2018-09-06T22:00:00.000Z",
 *                   "end_date":"2018-09-08T22:00:00.000Z"
 *                  }
 *     }
 */
router
  .route("/requests/:request/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["absences", "id", req.params.request],
        function(err, results, fields) {
          connection.release();
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results || results.length == 0)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUEST_NOT_FOUND" })
              );
          if (req.params.version == "false") {
            return res
              .status(201)
              .send(
                JSON.stringify({
                  success: true,
                  error: null,
                  request: results[0]
                })
              );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

/**
 * @api {get} /employees/:version                                               Get My Employees
 * @apiName   Get My Employees
 * @apiDescription Get a list of all Employees of requesting user
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} users                                                   String containing the stringified list of users
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "users": [
 *                  {
 *                   "name":"Pippo",
 *                   "surname":"Pluto",
 *                   "email":"pippo@pluto.it"
 *                  },
 *                  {
 *                   "name":"Paolino",
 *                   "surname":"Paperino",
 *                   "email":"paolino@paperino.it"
 *                  }
 *                 ]
 *     }
 */
router
  .route("/employees/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ??,?? WHERE ?? = ?? AND ??=?",
        [
          "users",
          "supervisions",
          "supervisions.id_user",
          "users.id",
          "supervisions.id_boss",
          req.user.id
        ],
        function(err, results, fields) {
          connection.release();
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "RESOURCE_NOT_FOUND" })
              );
          var array = [];
          for (var i = 0; i < results.length; i++) {
            array.push(make_user_safe(results[i]));
          }
          if (req.params.version == "false") {
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, users: array })
              );
          } else {
            var string = JSON.stringify(array);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

/**
 * @api {get} /employees/requests/:employee/:version                            Get Employee Requests
 * @apiName   Get Employee Requests
 * @apiDescription Get a list of all Requests made by specified requesting user's Employee
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiParam {Number} employee                                                  Id of the employee
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} requests                                                String containing the stringified list of requests
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "requests": [
 *                  {  "id":4,
 *                   "id_user":1,
 *                   "state":0,
 *                   "reason":"Malattia",
 *                   "justification_file":"absences/requests/get_justification/4.png",
 *                   "start_date":"2018-09-06T22:00:00.000Z",
 *                   "end_date":"2018-09-08T22:00:00.000Z"
 *                  }
 *                 ]
 *     }
 */
router
  .route("/employees/requests/:employee/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ??,?? WHERE ?? = ?? AND ??=? AND ??=?",
        [
          "absences",
          "supervisions",
          "supervisions.id_user",
          "absences.id_user",
          "supervisions.id_boss",
          req.user.id,
          "absences.id_user",
          req.params.employee
        ],
        function(err, results, fields) {
          connection.release();
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUESTS_NOT_FOUND" })
              );
          if (req.params.version == "false") {
            return res
              .status(201)
              .send(
                JSON.stringify({
                  success: true,
                  error: null,
                  requests: results
                })
              );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

/**
 * @api {get} /employees/requests/:version                                      Get Employees Requests
 * @apiName   Get Employees Requests
 * @apiDescription Get a list of all Requests made by anyone of the requesting user's Employee
 * @apiError           (Error 500) InternalServerError                          Query failed.
 * @apiErrorExample    {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         success : false,
 *         error : "INTERNAL_SERVER_ERROR"
 *      }
 * @apiGroup Absences
 * @apiParam {String} version                                                   If "true" the request returns a version code of the value
 * @apiHeader {String} Authorization                                            Authentication Token
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "bearer <token>"
 *     }
 * @apiSuccess {Boolean} success                                                True if query is succcessfully
 * @apiSuccess {String} error                                                   String containing the error, it's null if success is true.
 * @apiSuccess {String} requests                                                String containing the stringified list of requests
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "error": null
 *       "requests": [
 *                  {  "id":4,
 *                   "id_user":1,
 *                   "state":0,
 *                   "reason":"Malattia",
 *                   "justification_file":"absences/requests/get_justification/4.png",
 *                   "start_date":"2018-09-06T22:00:00.000Z",
 *                   "end_date":"2018-09-08T22:00:00.000Z"
 *                  },
 *                 {  "id":50,
 *                   "id_user":13,
 *                   "state":1,
 *                   "reason":"Ferie",
 *                   "justification_file":"absences/requests/get_justification/50.pdf",
 *                   "start_date":"2018-10-06T22:00:00.000Z",
 *                   "end_date":"2018-10-15T22:00:00.000Z"
 *                  }
 *                 ]
 *     }
 */
router
  .route("/employees/requests/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "SELECT * FROM ??,?? WHERE ?? = ?? AND ??=?",
        [
          "absences",
          "supervisions",
          "supervisions.id_user",
          "absences.id_user",
          "supervisions.id_boss",
          req.user.id
        ],
        function(err, results, fields) {
          connection.release();
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "REQUESTS_NOT_FOUND" })
              );
          if (req.params.version == "false") {
            return res
              .status(201)
              .send(
                JSON.stringify({
                  success: true,
                  error: null,
                  requests: results
                })
              );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(201)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

module.exports = router;
