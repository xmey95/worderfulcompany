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

    list_previous_questions(survey : number) : QuestionsType[] {
      var url = this.api + "surveys/" + survey;
      this.HttpClient.get<QuestionsResponseType>(url, {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
    }).subscribe(data => {
        if(!data.success){
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if(data.error){
            console.log(data.error);
          }
          return null;
        }
        return data.questions;
      },err =>{
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return null;
      });
      return null;
    }
}
