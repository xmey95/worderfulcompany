import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA,
  MatStepper
} from "@angular/material";
import { RequestsSurveysService } from "../requests.service";
import {
  QuestionsType,
  SurveyCreationResponseType,
  QuestionsResponseType,
  SuccessResponseType
} from "../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, interval } from "rxjs";
import { Router } from "@angular/router";
import swal from "sweetalert";
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

  answers: string[];
  questions: any;
  previous_questions: QuestionsType[] = [];
  previous_answers: string[];

  timer: any;
  ArrayStep: number[];

  private api: string; //api base url

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private RequestsSurveysService: RequestsSurveysService,
    private UserService: UserService,
    private HttpClient: HttpClient,
    private router: Router
  ) {
    this.api = (<any>config).api;
    this.questions = [];
    this.answers = [];
    this.ArrayStep = [];
    this.timer = interval(1000);
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

  insertAnswer() {
    this.answers.push(this.answer);
    this.answer = "";
  }

  goForward(stepper: MatStepper) {
    var url = this.api + "surveys/surveys";
    //new request's data
    var post = {
      name: this.name
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
      answers: null,
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
      question.answer = this.answers.toString();
      question.answers = this.answers;
    }

    this.question = "None";
    this.answers = [];
    this.previous_answer = "";
    this.previous_question = null;

    this.questions.push(question);
  }

  forwardStep() {
    this.RequestsSurveysService.sendQuestions(this.survey, this.questions);
    this.upgradeQuestionsList();
    this.questions = [];
    this.ArrayStep.push(this.step);
    this.step++;
  }

  goForwardEnd(stepper: MatStepper) {
    if (this.questions && this.questions.length > 0) this.forwardStep();
    this.timer.subscribe(x => this.upgradeQuestionsList());
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
        this.previous_questions = data.questions;
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  multipleQuestions(): QuestionsType[] {
    return this.previous_questions.filter(
      question => question.type == "Multiple"
    );
  }

  stepQuestions(step: number): QuestionsType[] {
    return this.previous_questions.filter(question => question.step == step);
  }

  questionanswers(question: QuestionsType) {
    return question.answer.split(",");
  }

  deleteBeforeInsert(question: any) {
    var index = this.questions.indexOf(question);
    if (index > -1) {
      this.questions.splice(index, 1);
    }
  }

  deleteAnswer(answer) {
    var index = this.answers.indexOf(answer);
    if (index > -1) {
      this.answers.splice(index, 1);
    }
  }

  openDialog(question): void {
    let dialogRef = this.dialog.open(ModifyQuestionComponent, {
      data: { question: question, survey: this.survey }
    });
  }

  deleteSurvey() {
    swal({
      title: "Sei sicuro?",
      text:
        "Una volta eliminato perderai tutti i progressi relativi al sondaggio",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        this.RequestsSurveysService.deleteSurvey(this.survey);
        this.router.navigate(["/home"]);
      }
    });
  }

  finishCreation() {
    swal({
      title: "Sei sicuro?",
      text: "Assicurati di aver controllato il riepilogo",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        swal("Fatto!", "Sondaggio creato con successo!", "success");
        this.router.navigate(["/home"]);
      } else {
      }
    });
  }
}

@Component({
  selector: "modify-question",
  templateUrl: "modify-question/modify-question.component.html",
  styleUrls: ["modify-question/modify-question.component.css"]
})
export class ModifyQuestionComponent {
  types: string[] = ["Open", "Multiple"];

  question: string;
  answer: string;
  type: string;
  step: number;
  condition: boolean = false;

  previous_question: QuestionsType;
  previous_answer: string;

  answers: string[] = [];
  previous_questions: QuestionsType[] = [];
  previous_answers: string[];

  private api: string;
  constructor(
    public dialogRef: MatDialogRef<ModifyQuestionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { question: QuestionsType; survey: number },
    private UserService: UserService,
    private HttpClient: HttpClient,
    private RequestsSurveysService: RequestsSurveysService
  ) {
    this.api = (<any>config).api;
    if (this.data.question.answer.length > 3)
      this.answers = this.questionanswers(this.data.question);
    this.question = this.data.question.question;
    this.type = this.data.question.type;
    this.step = this.data.question.step;
    this.condition = this.data.question.condition_answer ? false : true;
    this.upgradeQuestionsList();
  }

  insertAnswer() {
    this.answers.push(this.answer);
    this.answer = "";
  }

  fillanswerslist(question) {
    if (!question.answer) {
      return;
    }
    this.previous_answers = question.answer.split(",");
  }

  upgradeQuestionsList() {
    var url = this.api + "surveys/surveys/" + this.data.survey;
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
        this.previous_questions = data.questions;
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
    return;
  }

  multipleQuestions(): QuestionsType[] {
    return this.previous_questions.filter(
      question => question.type == "Multiple"
    );
  }

  questionanswers(question: QuestionsType) {
    return question.answer.split(",");
  }

  deleteAnswer(answer) {
    var index = this.answers.indexOf(answer);
    if (index > -1) {
      this.answers.splice(index, 1);
    }
  }

  /**
   * Method called when user clicks 'ok' button, just closes the dialog and submit modify
   */
  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.RequestsSurveysService.deleteQuestion(this.data.question.id);
    this.upgradeQuestionsList();
    this.dialogRef.close();
  }

  submit(): void {
    var post = {
      question: this.question,
      answer: "",
      type: this.type,
      condition: "false",
      previous_question: -1,
      previous_answer: ""
    };

    if (this.type == "Multiple") {
      post.answer = this.answers.toString();
    }

    if (this.condition == true) {
      post.condition = "true";
      post.previous_question = this.previous_question.id;
      post.previous_answer = this.previous_answer;
    }

    this.RequestsSurveysService.modifyQuestion(this.data.question.id, post);
    this.upgradeQuestionsList();
    this.dialogRef.close();
  }
}
