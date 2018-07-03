import { Component, OnInit } from "@angular/core";
import { MatStepper } from "@angular/material";
import { RequestsSurveysService } from "../requests.service";
import {
  QuestionsType,
  QuestionsResponseType,
  SuccessResponseType,
  ConditionResponseType
} from "../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, interval } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import swal from "sweetalert";
import { switchMap, map, share, filter } from "rxjs/operators";
import { UserService } from "../../user.service";
import * as config from "../../config.json";

@Component({
  selector: "compile",
  templateUrl: "./compile.component.html",
  styleUrls: ["./compile.component.css"]
})
export class CompileComponent implements OnInit {
  survey: any;
  id: number;

  step: number;

  questions: QuestionsType[];

  ArrayStep: number[];

  private api: string;

  constructor(
    private RequestsSurveysService: RequestsSurveysService,
    private UserService: UserService,
    private HttpClient: HttpClient,
    private route: ActivatedRoute
  ) {
    this.api = (<any>config).api;

    this.route.params.subscribe(res => (this.id = res.id));

    this.ArrayStep = [];

    this.upgradeQuestionsList();
  }

  upgradeQuestionsList() {
    var url = this.api + "surveys/surveys/" + this.id;
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
        this.questions = data.questions;
        this.step = data.step[0].step;
        this.survey = data.survey;
        this.createArrayStep();
        for (var i = 0; i < this.questions.length; i++) {
          this.isConditioned(this.questions[i]);
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

  stepQuestions(step: number): QuestionsType[] {
    return this.questions.filter(question => question.step == step);
  }

  createArrayStep() {
    for (var i = 1; i <= this.step; i++) {
      this.ArrayStep.push(i);
    }
    console.log(this.ArrayStep);
  }

  AnswersList(question): string[] {
    return question.answer.split(",");
  }

  isConditioned(question) {
    if (question.condition_answer == 0) {
      question.condition_confirmed = true;
      return;
    }
    var url = this.api + "surveys/isconditioned/" + question.id;
    this.HttpClient.get<ConditionResponseType>(url, {
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
        if (data.condition == "true") {
          question.condition_confirmed = true;
        } else {
          question.condition_confirmed = false;
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

  forwardStep(stepper: MatStepper, step) {
    for (var i = 0; i < this.stepQuestions(step).length; i++) {
      if (this.stepQuestions(step)[i].answer_compile) {
        var url =
          this.api + "surveys/answers/" + this.stepQuestions(step)[i].id;
        var post = {
          answer: this.stepQuestions(step)[i].answer_compile
        };
        this.HttpClient.post<SuccessResponseType>(url, post, {
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
            for (var i = 0; i < this.questions.length; i++) {
              this.isConditioned(this.questions[i]);
            }
          },
          err => {
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          }
        );
      }
    }
    if (step == this.ArrayStep[this.ArrayStep.length - 1]) {
      //Inserisci la sottoscrizione nel db e chiudi il sondaggio
    } else {
      stepper.next();
    }
  }

  ngOnInit() {}
}
