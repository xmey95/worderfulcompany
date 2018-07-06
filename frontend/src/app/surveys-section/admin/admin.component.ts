import { Component, OnInit } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatStepper } from "@angular/material";
import { RequestsSurveysService } from "../requests.service";
import {
  SurveyAdminType,
  SurveyAdminResponseType,
  QuestionsResponseType,
  QuestionsType,
  PercentualAnswerResponseType,
  UsersResponseType,
  UsersSubmittedResponseType,
  AnswerResponseType
} from "../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import swal from "sweetalert";
import { UserService } from "../../user.service";
import * as config from "../../config.json";

/**
 * This component shows frontend section for survey administration, and contains an expandible list for every survey and a summary with answers of all users
 */

@Component({
  selector: "admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"]
})
export class AdminComponent implements OnInit {
  surveys: SurveyAdminType[]; //list of all surveys
  api: string;
  current_user: string; //current user

  constructor(
    private UserService: UserService,
    private HttpClient: HttpClient,
    private router: Router,
    private RequestsSurveysService: RequestsSurveysService,
    public snackBar: MatSnackBar
  ) {
    this.api = (<any>config).api;
    this.Setup();
  }

  createArrayStep(survey: SurveyAdminType) {
    for (var i = 1; i <= survey.step; i++) {
      survey.ArrayStep.push(i);
    }
  }

  /**
   * Pull questions already submitted from database
   */

  fillQuestions(survey) {
    var url = this.api + "surveys/surveys/" + survey.id;
    this.HttpClient.get<QuestionsResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        survey.questions = data.questions;
        survey.step = data.step[0].step;
        survey.ArrayStep = [];
        this.createArrayStep(survey);
        for (var i = 0; i < survey.questions.length; i++) {
          this.fillAnswerPercentual(survey.questions[i]); //Pull Percentual of answers
        }
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  /**
   * Delete survey from database(with related questions ecc...)
   */

  deleteSurvey(survey) {
    swal({
      title: "Sei sicuro?",
      text:
        "Una volta eliminato perderai tutti i progressi relativi al sondaggio",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        this.RequestsSurveysService.deleteSurvey(survey.id);
        var index = this.surveys.indexOf(survey);
        if (index > -1) {
          this.surveys.splice(index, 1);
        }
      }
    });
  }

  /**
   * Create array with all answers of question and insert percentage
   */

  fillAnswerPercentual(question) {
    if (question.type == "Open") return;
    question.percentual_answers = [];
    for (var i = 0; i < question.answer.split(",").length; i++) {
      var percentual = {
        answer: question.answer.split(",")[i],
        percentual: 0
      };
      this.injectPercentual(
        question.id,
        question.percentual_answers,
        percentual
      );
    }
  }

  /**
   * Pull from database percentages of answers
   */

  injectPercentual(id, percentual_answers, percentual) {
    var url =
      this.api + "surveys/answers/percentual/" + id + "/" + percentual.answer;
    this.HttpClient.get<PercentualAnswerResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        percentual.percentual = data.percentual; //Pull percentual
        percentual_answers.push(percentual); //Push answer in array
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  /**
   * Return true if specified percentual is greater of all others answer percentages of the question
   */

  isMax(percentual, percentual_answers) {
    var ismax = true;
    for (var i = 0; i < percentual_answers.length; i++) {
      if (percentual_answers[i].percentual > percentual) ismax = false;
    }
    return ismax;
  }

  /**
   * Return only questions of specified step passed by parameter
   */

  stepQuestions(survey: SurveyAdminType, step: number): QuestionsType[] {
    return survey.questions.filter(question => question.step == step);
  }

  /**
   * Pull from database all users that submitted survey
   */

  fillUserList(survey) {
    var url = this.api + "surveys/usersubmitted/" + survey.id;
    this.HttpClient.get<UsersSubmittedResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        var users = [];
        for (var i = 0; i < data.users.length; i++) {
          users.push(data.users[i].id_user); //Push id of user into array
        }
        this.RequestallUsers(users, survey); //Filter users using array before created
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  /**
   * Pull all users from database and push only users that submitted survey
   */

  RequestallUsers(users, survey) {
    survey.users = [];
    var url = this.api + "users/false";
    this.HttpClient.get<UsersResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        survey.users = [];
        survey.users = data.users.filter(user => users.includes(user.id)); //Filter function
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  /**
   * Pull from database answer submitted by specified user in specified question
   */

  showAnswer(question) {
    question.answer_of_user = "";
    if (!question.current_user) return;
    var url =
      this.api +
      "surveys/answersubmitted/" +
      question.id +
      "/" +
      question.current_user;
    this.HttpClient.get<AnswerResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          //answer not found
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open(
            "Risposta non trovata, la domanda e' condizionale e non e' stata sottoposta all'utente",
            "OK",
            config
          );
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        question.answer_of_user = data.answer; //Pull answer
      },
      err => {
        //answer not found
        let config = new MatSnackBarConfig();
        config.duration = 2000;
        this.snackBar.open(
          "Risposta non trovata, la domanda e' condizionale e non e' stata sottoposta all'utente",
          "OK",
          config
        );
        console.log(err);
        return;
      }
    );
    return;
  }

  Setup() {
    var url = this.api + "surveys/mysurveys";
    this.HttpClient.get<SurveyAdminResponseType>(url, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        this.surveys = data.surveys;
        for (var i = 0; i < this.surveys.length; i++) {
          this.fillQuestions(this.surveys[i]); //Fill all informations of questions
          this.fillUserList(this.surveys[i]); //Fill all users that submitted survey
        }
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
  }

  ngOnInit() {}
}
