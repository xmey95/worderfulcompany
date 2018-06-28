import { Component, Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { SurveyCreationResponseType, QuestionsResponseType, QuestionsType } from '../interfaces'
import * as config from '../config.json';
import  swal from 'sweetalert';
import { UserService } from '../user.service'

/**
 * This service can be used for all the survey-related funtionality. It's methods sends propr requests to backend to get and update values in the database
 */
@Injectable()
export class RequestsSurveysService {
    private api : string; //api base url

    /**
      *
      */
    constructor(private HttpClient: HttpClient, private UserService: UserService) {
        this.api = (<any>config).api;
    }

    create_survey(name : string) {
      var url = this.api + "surveys/surveys";
      //new request's data
      var post = {
        "name" : name
      }
      //http request to backend (with authorization header containing the token got from UserService)
      this.HttpClient.post<SurveyCreationResponseType>(url,
      post,  {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
    }).subscribe(data => {
        if(data.success == true){
          console.log(data.survey);
          return data.survey;
        }
        return -1;
      },err =>{
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return -1;
      });
    }
}
