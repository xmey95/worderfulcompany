import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material';
import { RequestsSurveysService } from '../requests.service';
import { QuestionsType, SurveyCreationResponseType } from '../../interfaces'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { UserService } from '../../user.service'
import * as config from '../../config.json';

@Component({
  selector: 'createsurvey',
  templateUrl: './createsurvey.component.html',
  styleUrls: ['./createsurvey.component.css']
})
export class CreatesurveyComponent implements OnInit {

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  name : string;
  survey : any;

  previous_questions : QuestionsType[]

  private api : string; //api base url

  constructor(private _formBuilder: FormBuilder, private RequestsSurveysService: RequestsSurveysService, private UserService: UserService,private HttpClient: HttpClient) {
    this.api = (<any>config).api;
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  goForward(stepper: MatStepper){
    var url = this.api + "surveys/surveys";
    //new request's data
    var post = {
      "name" : name
    }
    //http request to backend (with authorization header containing the token got from UserService)
    this.HttpClient.post<SurveyCreationResponseType>(url,
    post,  {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
  }).subscribe(data => {
      if(data.success){
        this.survey = data.survey;
      }
    },err =>{
      swal("Oops!", "Errore durante l'operazione!", "error");
      console.log(err);
    });
    stepper.next();
  }

}
