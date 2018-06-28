import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatStepper } from "@angular/material";
import { RequestsSurveysService } from "../requests.service";
import {
  QuestionsType,
  SurveyCreationResponseType,
  QuestionsResponseType,
  SuccessResponseType
} from "../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, interval } from "rxjs";
import { switchMap, map, share, filter } from "rxjs/operators";
import { UserService } from "../../user.service";
import * as config from "../../config.json";

@Component({
  selector: "createsurvey",
  templateUrl: "./createsurvey.component.html",
  styleUrls: ["./createsurvey.component.css"]
})
export class CreatesurveyComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  name: string;
  survey: any;

  types: string[] = ["Open", "Multiple"];

  question: string;
  answer: string;
  type: string;
  step: number = 1;
  condition: boolean = false;

  previous_question: QuestionsType;
  previous_answer: string;

  questions: any;

  previous_questions: QuestionsType[] = [];
  previous_answers: string[];

  private api: string; //api base url

  constructor(
    private _formBuilder: FormBuilder,
    private RequestsSurveysService: RequestsSurveysService,
    private UserService: UserService,
    private HttpClient: HttpClient
  ) {
    this.api = (<any>config).api;
    this.questions = [];
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ["", Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      question: ["", Validators.required],
      answer: [""],
      type: [""],
      check: [""],
      pq: [""],
      pa: [""]
    });
  }

  goForward(stepper: MatStepper) {
    var url = this.api + "surveys/surveys";
    //new request's data
    var post = {
      name: name
    };
    //http request to backend (with authorization header containing the token got from UserService)
    this.HttpClient.post<SurveyCreationResponseType>(url, post, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (data.success) {
          this.survey = data.survey;
        }
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
      }
    );
    stepper.next();
  }

  insertQuestion() {
    var question = {
      question: this.question,
      answer: "",
      type: this.type,
      condition: "false",
      previous_question: -1,
      previous_answer: ""
    };

    if (this.condition == true) {
      question.condition = "true";
      question.previous_question = this.previous_question.id;
      question.previous_answer = this.previous_answer;
    }

    if (this.type == "Multiple") {
      question.answer = this.answer;
    }

    this.question = "";
    this.answer = "";
    this.previous_answer = "";
    this.previous_question = null;

    this.questions.push(question);
  }

  forwardStep() {
    var url = this.api + "surveys/surveys/" + this.survey;
    //new request's data
    var post = {
      questions: JSON.stringify(this.questions)
    };
    //http request to backend (with authorization header containing the token got from UserService)
    this.HttpClient.post<SuccessResponseType>(url, post, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      data => {
        if (!data.success) {
          console.log(data.error);
          return;
        }
        this.upgradeQuestionsList();
        this.questions = [];
        this.step++;
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
      }
    );
  }

  goForwardEnd(stepper: MatStepper) {
    this.forwardStep();
    stepper.next();
  }

  fillanswerslist(question) {
    if (!question.answer) {
      return;
    }
    this.previous_answers = question.answer.split(",");
  }

  upgradeQuestionsList() {
    var url = this.api + "surveys/surveys/" + this.survey;
    console.log(url);
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
        for (var i = 0; i < data.questions.length; i++) {
          if (data.questions[i].type == "Multiple") {
            this.previous_questions.push(data.questions[i]);
          }
        }
        console.log(JSON.stringify(data));
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }
}
