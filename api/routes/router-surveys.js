var path = require("path");
var express = require("express");
var mysql = require("mysql");
var auth = require("../auth.js");
var config = require("../config.js");
var router = express.Router(); // new instance of express router
var crypto = require("crypto");

//MySQL Connection
if (process.argv[3] == "--mac") {
  var pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    port: config.port,
    password: "root",
    database: config.dbname,
    multipleStatements: true
  });
} else {
  var pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbsecret,
    database: config.dbname,
    multipleStatements: true
  });
}

function send_questions(connection, questions, index, req, res, step) {
  condition = 0;
  if (questions[index].condition == "true") condition = 1;
  var post = {
    question: questions[index].question,
    answer: questions[index].answer,
    type: questions[index].type,
    step: step,
    condition_answer: condition,
    id_survey: req.params.survey
  };
  connection.query("INSERT INTO ?? SET ?", ["questions", post], function(
    err,
    results,
    fields
  ) {
    if (err) {
      console.log(err);
      if (index > 0) {
        send_questions(connection, questions, index - 1, req, res, step);
      }
      return;
    }

    if (questions[index].condition == "true") {
      var post = {
        answer: questions[index].previous_answer,
        id_p_question: questions[index].previous_question,
        id_question: results.insertId
      };
      connection.query("INSERT INTO ?? SET ?", ["conditions", post], function(
        err,
        results,
        fields
      ) {
        if (err) console.log(err);
        if (index > 0) {
          send_questions(connection, questions, index - 1, req, res, step);
        }
      });
    } else {
      if (index > 0) {
        send_questions(connection, questions, index - 1, req, res, step);
      }
    }
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

router.get("/", function(req, res) {
  res.json({
    message:
      'Benvenuto alle API della Web App "WonderfulCompany"(sezione sondaggi), effettua una richiesta valida :)'
  });
});

//Create an empty survey
router.route("/surveys").post(auth.isAuthenticated, function(req, res) {
  pool.getConnection(function(err, connection) {
    // Use the connection
    var post = { name: req.body.name, id_user: req.user.id };
    connection.query("INSERT INTO ?? SET ?", ["surveys", post], function(
      err,
      results,
      fields
    ) {
      var id = results.insertId;
      connection.release();
      if (err)
        return res
          .status(500)
          .send(JSON.stringify({ success: false, error: err }));
      res
        .status(201)
        .send(JSON.stringify({ success: true, error: null, survey: id }));
    });
  });
});

router
  .route("/allsurveys/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query("SELECT * FROM ??", ["surveys"], function(
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
              JSON.stringify({ success: false, error: "SURVEYS_NOT_FOUND" })
            );

        if (req.params.version == "false") {
          return res
            .status(200)
            .send(
              JSON.stringify({ success: true, error: null, surveys: results })
            );
        } else {
          var string = JSON.stringify(results);
          string = crypto
            .createHash("sha1")
            .update(string)
            .digest("hex");
          return res
            .status(200)
            .send(
              JSON.stringify({ success: true, error: null, version: string })
            );
        }
      });
    });
  });

router.route("/mysurveys/").get(auth.isAuthenticated, function(req, res) {
  pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query(
      "SELECT * FROM ?? WHERE ?? = ?",
      ["surveys", "id_user", req.user.id],
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
              JSON.stringify({ success: false, error: "SURVEYS_NOT_FOUND" })
            );

        return res
          .status(200)
          .send(
            JSON.stringify({ success: true, error: null, surveys: results })
          );
      }
    );
  });
});

router
  .route("/allsurveyssubmitted/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT ?? FROM ?? WHERE ?? = ?",
        ["id_survey", "surveyuser", "id_user", req.user.id],
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
                JSON.stringify({ success: false, error: "SURVEYS_NOT_FOUND" })
              );

          if (req.params.version == "false") {
            return res
              .status(200)
              .send(
                JSON.stringify({ success: true, error: null, surveys: results })
              );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(200)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

router
  .route("/usersubmitted/:survey")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT ?? FROM ?? WHERE ?? = ?",
        ["id_user", "surveyuser", "id_survey", req.params.survey],
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
                JSON.stringify({ success: false, error: "SURVEYS_NOT_FOUND" })
              );

          return res
            .status(200)
            .send(
              JSON.stringify({ success: true, error: null, users: results })
            );
        }
      );
    });
  });

router
  .route("/isconditioned/:id")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["conditions", "id_question", req.params.id],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(JSON.stringify({ success: false, error: "NOT_FOUND" }));

          var condition = results;
          connection.query(
            "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?",
            [
              "answers",
              "id_question",
              condition[0].id_p_question,
              "id_user",
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
                  .send(JSON.stringify({ success: false, error: "NOT_FOUND" }));

              var answer = results;
              var condition_result = "false";
              if (answer[0]) {
                if (condition[0].answer == answer[0].answer) {
                  condition_result = "true";
                }
              }
              return res.status(200).send(
                JSON.stringify({
                  success: true,
                  error: null,
                  condition: condition_result
                })
              );
            }
          );
        }
      );
    });
  });

//Add or delete a step in specified survey or view specified survey
router
  .route("/surveys/:survey")
  .post(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      var questions = [];
      if (req.body.questions) questions = JSON.parse(req.body.questions);
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ? = ?",
        ["surveys", "id", req.params.survey],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "SURVEY_NOT_FOUND" })
              );

          connection.query(
            "SELECT MAX(??) AS step FROM ?? WHERE ?? = ?",
            ["step", "questions", "id_survey", req.params.survey],
            function(err, results, fields) {
              if (err)
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              if (!results)
                return res
                  .status(404)
                  .send(
                    JSON.stringify({ success: false, error: "STEP_NOT_FOUND" })
                  );

              var step = results[0].step + 1;
              var index = questions.length - 1;

              send_questions(connection, questions, index, req, res, step);
            }
          );
          connection.release();
          return res
            .status(201)
            .send(JSON.stringify({ success: true, error: null }));
        }
      );
    });
  })
  .delete(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT ?? FROM ?? WHERE ?? = ?",
        ["id", "questions", "id_survey", req.params.survey],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTIONS_NOT_FOUND" })
              );

          for (var i = 0; i < results.length; i++) {
            connection.query(
              "DELETE FROM ?? WHERE ?? = ?; DELETE FROM ?? WHERE ?? = ?",
              [
                "answers",
                "id_question",
                results[i].id,
                "conditions",
                "id_question",
                results[i].id
              ],
              function(err, results, fields) {
                if (err)
                  return res
                    .status(500)
                    .send(JSON.stringify({ success: false, error: err }));
                if (!results)
                  return res.status(404).send(
                    JSON.stringify({
                      success: false,
                      error: "CONDITIONS_AND_ANSWERS_NOT_FOUND"
                    })
                  );
              }
            );
          }

          connection.query(
            "DELETE FROM ?? WHERE ?? = ?; DELETE FROM ?? WHERE ?? = ?",
            [
              "questions",
              "id_survey",
              req.params.survey,
              "surveys",
              "id",
              req.params.survey
            ],
            function(err, results, fields) {
              if (err)
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              if (!results)
                return res.status(404).send(
                  JSON.stringify({
                    success: false,
                    error: "QUESTIONS_NOT_FOUND"
                  })
                );
            }
          );

          connection.release();
          return res
            .status(200)
            .send(JSON.stringify({ success: true, error: null }));
        }
      );
    });
  })
  .get(auth.isAuthenticated, function(req, res) {
    var questions = [];
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["surveys", "id", req.params.survey],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "SURVEYS_NOT_FOUND" })
              );

          var survey = results;

          connection.query(
            "SELECT * FROM ?? WHERE ?? = ?",
            ["questions", "id_survey", req.params.survey],
            function(err, results, fields) {
              if (err)
                return res
                  .status(500)
                  .send(JSON.stringify({ success: false, error: err }));
              if (!results)
                return res.status(404).send(
                  JSON.stringify({
                    success: false,
                    error: "QUESTIONS_NOT_FOUND"
                  })
                );

              questions = results;

              connection.query(
                "SELECT MAX(??) AS ?? FROM ?? WHERE ?? = ?",
                ["step", "step", "questions", "id_survey", req.params.survey],
                function(err, results, fields) {
                  if (err)
                    return res
                      .status(500)
                      .send(JSON.stringify({ success: false, error: err }));
                  if (!results)
                    return res.status(404).send(
                      JSON.stringify({
                        success: false,
                        error: "QUESTIONS_NOT_FOUND"
                      })
                    );

                  var step = results;
                  connection.release();
                  return res.status(200).send(
                    JSON.stringify({
                      success: true,
                      error: null,
                      survey: survey,
                      questions: questions,
                      step: step
                    })
                  );
                }
              );
            }
          );
        }
      );
    });
  });

//Modify, get or delete question
router
  .route("/questions/:question")
  .put(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      if (req.body.condition_change == "true") {
        connection.query(
          "SELECT ?? FROM ?? WHERE ?? = ?",
          ["condition_answer", "questions", "id", req.params.question],
          function(err, results, fields) {
            if (err)
              return res
                .status(500)
                .send(JSON.stringify({ success: false, error: err }));
            if (!results)
              return res.status(404).send(
                JSON.stringify({
                  success: false,
                  error: "QUESTION_NOT_FOUND"
                })
              );

            connection.query(
              "DELETE FROM ?? WHERE ?? = ?",
              ["conditions", "id", results[0].condition_answer],
              function(err, results, fields) {
                if (err)
                  return res
                    .status(500)
                    .send(JSON.stringify({ success: false, error: err }));
                if (!results)
                  return res.status(404).send(
                    JSON.stringify({
                      success: false,
                      error: "CONDITION_NOT_FOUND"
                    })
                  );
                if (req.body.condition == "true") {
                  var post = {
                    answer: req.body.previous_answer,
                    id_p_question: req.body.previous_question,
                    id_question: req.params.question
                  };
                  connection.query(
                    "INSERT INTO ?? SET ?",
                    ["conditions", post],
                    function(err, results, fields) {
                      if (err)
                        return res
                          .status(500)
                          .send(JSON.stringify({ success: false, error: err }));
                      if (!results)
                        return res.status(404).send(
                          JSON.stringify({
                            success: false,
                            error: "CONDITION_NOT_FOUND"
                          })
                        );

                      var post = {
                        answer: req.body.answer,
                        question: req.body.question,
                        type: req.body.type,
                        condition_answer: results.insertId
                      };
                      connection.query(
                        "UPDATE ?? SET ? WHERE ?? = ?",
                        ["questions", post, "id", req.params.question],
                        function(err, results, fields) {
                          if (err)
                            return res
                              .status(500)
                              .send(
                                JSON.stringify({ success: false, error: err })
                              );
                          if (!results)
                            return res.status(404).send(
                              JSON.stringify({
                                success: false,
                                error: "QUESTION_NOT_FOUND"
                              })
                            );
                        }
                      );
                    }
                  );
                } else {
                  var post = {
                    answer: req.body.answer,
                    question: req.body.question,
                    type: req.body.type
                  };
                  connection.query(
                    "UPDATE ?? SET ? WHERE ?? = ?",
                    ["questions", post, "id", req.params.question],
                    function(err, results, fields) {
                      if (err)
                        return res
                          .status(500)
                          .send(JSON.stringify({ success: false, error: err }));
                      if (!results)
                        return res.status(404).send(
                          JSON.stringify({
                            success: false,
                            error: "QUESTION_NOT_FOUND"
                          })
                        );
                    }
                  );
                }
              }
            );
          }
        );
      } else {
        var update = {
          answer: req.body.answer,
          question: req.body.question,
          type: req.body.type
        };
        connection.query(
          "UPDATE ?? SET ? WHERE ?? = ?",
          ["questions", update, "id", req.params.question],
          function(err, results, fields) {
            if (err)
              return res
                .status(500)
                .send(JSON.stringify({ success: false, error: err }));
            if (!results)
              return res.status(404).send(
                JSON.stringify({
                  success: false,
                  error: "QUESTION_NOT_FOUND"
                })
              );
          }
        );
      }
      connection.release();
      return res
        .status(200)
        .send(JSON.stringify({ success: true, error: null }));
    });
  })
  .delete(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      connection.query(
        "DELETE FROM ?? WHERE ?? = ?",
        ["questions", "id", req.params.question],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTION_NOT_FOUND" })
              );
          connection.release();
          return res
            .status(200)
            .send(JSON.stringify({ success: true, error: null }));
        }
      );
    });
  });

router
  .route("/questions/:question/:version")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["questions", "id", req.params.question],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTIONS_NOT_FOUND" })
              );
          connection.release();
          if (req.params.version == "false") {
            return res.status(200).send(
              JSON.stringify({
                success: true,
                error: null,
                survey: results,
                question: results
              })
            );
          } else {
            var string = JSON.stringify(results);
            string = crypto
              .createHash("sha1")
              .update(string)
              .digest("hex");
            return res
              .status(200)
              .send(
                JSON.stringify({ success: true, error: null, version: string })
              );
          }
        }
      );
    });
  });

router
  .route("/submitsurvey/:survey")
  .post(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      var post = {
        id_user: req.user.id,
        id_survey: req.params.survey
      };
      connection.query("INSERT INTO ?? SET ?", ["surveyuser", post], function(
        err,
        results,
        fields
      ) {
        if (err)
          return res
            .status(500)
            .send(JSON.stringify({ success: false, error: err }));
        if (!results)
          return res
            .status(404)
            .send(
              JSON.stringify({ success: false, error: "SURVEY_NOT_FOUND" })
            );
        connection.release();
        return res
          .status(201)
          .send(JSON.stringify({ success: true, error: null }));
      });
    });
  });

//Submit a question
router
  .route("/answers/:question")
  .post(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      var post = {
        answer: req.body.answer,
        id_question: req.params.question,
        id_user: req.user.id
      };
      connection.query("INSERT INTO ?? SET ?", ["answers", post], function(
        err,
        results,
        fields
      ) {
        if (err)
          return res
            .status(500)
            .send(JSON.stringify({ success: false, error: err }));
        if (!results)
          return res
            .status(404)
            .send(
              JSON.stringify({ success: false, error: "SURVEY_NOT_FOUND" })
            );
        connection.release();
        return res
          .status(201)
          .send(JSON.stringify({ success: true, error: null }));
      });
    });
  });

//Modify, get or delete specific answer
router
  .route("/answers/:question")
  .put(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?",
        [
          "answers",
          "answer",
          req.body.answer,
          "id_question",
          req.params.question,
          "id_user",
          req.user.id
        ],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "ANSWER_NOT_FOUND" })
              );
          connection.release();
          return res
            .status(200)
            .send(JSON.stringify({ success: true, error: null }));
        }
      );
    });
  })
  .delete(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "DELETE FROM ?? WHERE ?? = ?",
        ["answers", "id", req.params.answer],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "ANSWER_NOT_FOUND" })
              );
          connection.release();
          return res
            .status(200)
            .send(
              JSON.stringify({ success: true, error: null, answer: results })
            );
        }
      );
    });
  });

router
  .route("/answers/:question")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?",
        ["answers", "id_question", req.params.question, "id_user", req.user.id],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTIONS_NOT_FOUND" })
              );
          connection.release();

          return res.status(200).send(
            JSON.stringify({
              success: true,
              error: null,
              answer: results[0].answer
            })
          );
        }
      );
    });
  });

router
  .route("/answersubmitted/:question/:user")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?",
        [
          "answer",
          "answers",
          "id_question",
          req.params.question,
          "id_user",
          req.params.user
        ],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTIONS_NOT_FOUND" })
              );
          connection.release();

          return res.status(200).send(
            JSON.stringify({
              success: true,
              error: null,
              answer: results[0].answer
            })
          );
        }
      );
    });
  });

router
  .route("/answers/percentual/:question/:answer")
  .get(auth.isAuthenticated, function(req, res) {
    pool.getConnection(function(err, connection) {
      // Use the connection
      connection.query(
        "SELECT * FROM ?? WHERE ?? = ?",
        ["answers", "id_question", req.params.question],
        function(err, results, fields) {
          if (err)
            return res
              .status(500)
              .send(JSON.stringify({ success: false, error: err }));
          if (!results)
            return res
              .status(404)
              .send(
                JSON.stringify({ success: false, error: "QUESTIONS_NOT_FOUND" })
              );
          connection.release();

          var total = results.length;
          var partial = results.filter(
            question => question.answer == req.params.answer
          ).length;

          var percentual = (100 / total) * partial;

          return res.status(200).send(
            JSON.stringify({
              success: true,
              error: null,
              percentual: percentual
            })
          );
        }
      );
    });
  });

module.exports = router;
