import { Component, OnInit } from "@angular/core";
import { MatStepper } from "@angular/material";
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

@Component({
  selector: "admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"]
})
export class AdminComponent implements OnInit {
  surveys: SurveyAdminType[];
  api: string;
  current_user: string;

  constructor(
    private UserService: UserService,
    private HttpClient: HttpClient,
    private router: Router
  ) {
    this.api = (<any>config).api;
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
          this.fillQuestions(this.surveys[i]);
          this.fillUserList(this.surveys[i]);
        }
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
  }

  createArrayStep(survey: SurveyAdminType) {
    for (var i = 1; i <= survey.step; i++) {
      survey.ArrayStep.push(i);
    }
  }

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
          this.fillAnswerPercentual(survey.questions[i]);
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
        percentual.percentual = data.percentual;
        percentual_answers.push(percentual);
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  isMax(percentual, percentual_answers) {
    var ismax = true;
    for (var i = 0; i < percentual_answers.length; i++) {
      if (percentual_answers[i].percentual > percentual) ismax = false;
    }
    return ismax;
  }

  stepQuestions(survey: SurveyAdminType, step: number): QuestionsType[] {
    return survey.questions.filter(question => question.step == step);
  }

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
          users.push(data.users[i].id_user);
        }
        this.RequestallUsers(users, survey);
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

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
        survey.users = data.users.filter(user => users.includes(user.id));
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  showAnswer(question) {
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
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (data.error) {
            console.log(data.error);
          }
          return;
        }
        question.answer_of_user = data.answer;
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  ngOnInit() {}
}
