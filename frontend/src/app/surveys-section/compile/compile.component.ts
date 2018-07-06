import { Component, OnInit } from "@angular/core";
import { MatStepper } from "@angular/material";
import { RequestsSurveysService } from "../requests.service";
import {
  AnswerResponseType,
  QuestionsType,
  QuestionsResponseType,
  SuccessResponseType,
  ConditionResponseType
} from "../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, interval } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import swal from "sweetalert";
import { switchMap, map, share, filter } from "rxjs/operators";
import { UserService } from "../../user.service";
import * as config from "../../config.json";

/**
 * This component shows frontend section for survey compilation
 */

@Component({
  selector: "compile",
  templateUrl: "./compile.component.html",
  styleUrls: ["./compile.component.css"]
})
export class CompileComponent implements OnInit {
  survey: any; //survey object
  id: number; //id of survey
  recompile: string; //flag for recompiling

  step: number; //number of step of the survey

  questions: QuestionsType[]; //questions of th survey

  ArrayStep: number[];

  private api: string;

  constructor(
    private RequestsSurveysService: RequestsSurveysService,
    private UserService: UserService,
    private HttpClient: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.api = (<any>config).api;

    //Set variables from url parameters
    this.route.params.subscribe(res => (this.id = res.id));
    this.route.params.subscribe(res => (this.recompile = res.recompile));

    this.ArrayStep = [];

    this.upgradeQuestionsList(); //Pull questions from database
  }

  /**
   * Pull questions from database
   */

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
        //For every question fills condition answer
        for (var i = 0; i < this.questions.length; i++) {
          this.isConditioned(this.questions[i]);
          //If recopmile is true every question must to have previous answer
          if (this.recompile == "true") this.fillAnswer(this.questions[i]);
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
   * Return only questions of specified step passed by parameter
   */

  stepQuestions(step: number): QuestionsType[] {
    return this.questions.filter(question => question.step == step);
  }

  createArrayStep() {
    for (var i = 1; i <= this.step; i++) {
      this.ArrayStep.push(i);
    }
    console.log(this.ArrayStep);
  }

  /**
   * return answer list of question passed by parameter
   */

  AnswersList(question): string[] {
    return question.answer.split(",");
  }

  /**
   * Fill condition flag of specified question
   */

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

  /**
   * Fill previous answer submitted for specified question by user
   */

  fillAnswer(question) {
    var url = this.api + "surveys/answers/" + question.id;
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
        question.answer_compile = data.answer;
      },
      err => {
        console.log(err);
        return;
      }
    );
    return;
  }

  /**
   * Submit questions of current step and, if is the ultimate step, finish compilation or recompilation
   */

  forwardStep(stepper: MatStepper, step) {
    //case of recompilation
    if (this.recompile == "true") {
      //for every question submit new answer
      for (var i = 0; i < this.stepQuestions(step).length; i++) {
        if (this.stepQuestions(step)[i].answer_compile) {
          var url =
            this.api + "surveys/answers/" + this.stepQuestions(step)[i].id;
          var post = {
            answer: this.stepQuestions(step)[i].answer_compile
          };
          this.HttpClient.put<SuccessResponseType>(url, post, {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }).subscribe(
            data => {
              if (!data.success) {
                swal(
                  "Oops!",
                  "Errore durante l'invio della richiesta!",
                  "error"
                );
                if (data.error) {
                  console.log(data.error);
                }
                return;
              }
              //Refresh questins array with new values
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
    } else {
      //case of compilation for first time
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
                swal(
                  "Oops!",
                  "Errore durante l'invio della richiesta!",
                  "error"
                );
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
    }
    //Final Phase
    if (
      step == this.ArrayStep[this.ArrayStep.length - 1] &&
      this.recompile == "false"
    ) {
      //Create record for compilation
      var url = this.api + "surveys/submitsurvey/" + this.id;
      var post = {
        answer: "answer"
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
          swal("Fatto!", "Sondaggio compilato correttamente!", "success");
          this.router.navigate(["/home"]);
        },
        err => {
          swal("Oops!", "Errore durante l'operazione!", "error");
          console.log(err);
          return;
        }
      );
      return;
    } else if (
      step == this.ArrayStep[this.ArrayStep.length - 1] &&
      this.recompile == "true"
    ) {
      swal("Fatto!", "Sondaggio ricompilato correttamente!", "success");
    } else {
      stepper.next();
    }
  }

  ngOnInit() {}
}
