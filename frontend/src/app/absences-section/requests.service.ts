import { Component, Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { AddRequestResponseType, SuccessResponseType, RequestType, RequestsResponseType, UserType, UsersResponseType, VersionResponseType } from '../interfaces'
import * as config from '../config.json';
import  swal from 'sweetalert';
import { UserService } from '../user.service'
/*
This service can be used for the absence-requests-related funtionality.
*/

@Injectable()
export class RequestsService {
    private api : string; //api base url
    public myrequests$: Observable<RequestType[]>;
    private my_requests_version = ""; //version code for myrequests list
    public employees$: Observable<UserType[]>;
    private employees_version = ""; //version code for myrequests list
    public employees_requests$: Observable<RequestType[]>;
    private employees_requests_version = ""; //version code for myrequests list

    constructor(private HttpClient: HttpClient, private UserService: UserService) {
        this.api = (<any>config).api;

        //Observable to get the list of the requests of the User
        this.myrequests$ = interval(2000)
            .pipe(
                switchMap(() => this.HttpClient.get<VersionResponseType>(this.api + 'absences/myrequests/true', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                })), //this request gets version code
                filter((data: VersionResponseType) => {
                    if (data.version === this.my_requests_version) {
                        return false; //stop stream for this iteration, value has not changed from last check
                    }
                    this.my_requests_version = data.version;
                    return true;
                }),
                switchMap(() => this.HttpClient.get<RequestsResponseType>(this.api + 'absences/myrequests/false', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                })),
                map((data)=>{ return data.requests }), //save new value (get just requests field from response)
                share()
            );

            //Observable to get the list of the employees of the User
            this.employees$ = interval(1000)
                .pipe(
                    switchMap(() => this.HttpClient.get<VersionResponseType>(this.api + 'absences/employees/true', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                    })), //this request gets version code
                    filter((data: VersionResponseType) => {
                        if (data.version === this.employees_version) {
                            return false; //stop stream for this iteration, value has not changed from last check
                        }
                        this.employees_version = data.version;
                        return true;
                    }),
                    switchMap(() => this.HttpClient.get<UsersResponseType>(this.api + 'absences/employees/false', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                    })),
                    map((data)=>{ return data.users }), //save new value (get just requests field from response)
                    share()
                );

            //Observable to get the list of the requests made by any employee of the User
            this.employees_requests$ = interval(1000)
                .pipe(
                    switchMap(() => this.HttpClient.get<VersionResponseType>(this.api + 'absences/employees/requests/true', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                    })), //this request gets version code
                    filter((data: VersionResponseType) => {
                        if (data.version === this.employees_requests_version) {
                            return false; //stop stream for this iteration, value has not changed from last check
                        }
                        this.employees_requests_version = data.version;
                        return true;
                    }),
                    switchMap(() => this.HttpClient.get<RequestsResponseType>(this.api + 'absences/employees/requests/false', {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
                    })),
                    map((data)=>{ return data.requests }), //save new value (get just requests field from response)
                    share()
                );
    }

    approve_request(id){
      swal({
        title: "Conferma",
        text: "Vuoi davvero approvare la richiesta per questo permesso?",
        icon: "warning",
        dangerMode: true,
      })
      .then(willDelete => {
        if (willDelete) {
          var url = this.api + "absences/requests/approve/" + id;
          this.HttpClient.put<SuccessResponseType>(url,{},
          {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token())}).subscribe(res => {
            if(!res.success){
              swal("Oops!", "Errore durante l'operazione!", "error");
              if(res.error){
                console.log(res.error);
              }
              return;
            }
            swal("Fatto!", "Richiesta Approvata", "success");
          },err =>{
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          });
        }
      });
    }

    cancel_request(id){
      swal({
        title: "Conferma",
        text: "Vuoi davvero annullare la richiesta per questo permesso?",
        icon: "warning",
        dangerMode: true,
      })
      .then(willDelete => {
        if (willDelete) {
          var url = this.api + "absences/requests/" + id;
          this.HttpClient.delete<SuccessResponseType>(url,
          {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
          }).subscribe(res => {
            if(!res.success){
              swal("Oops!", "Errore durante l'operazione!", "error");
              if(res.error){
                console.log(res.error);
              }
              return;
            }
            swal("Fatto!", "Richiesta Eliminata", "success");
          },err =>{
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          });
        }
      });
    }

    modify_request(id, reason,start_date, end_date, fileList, dialog){
        start_date.setTime(start_date.getTime() + (2*60*60*1000));
        end_date.setTime(end_date.getTime() + (2*60*60*1000));
        var url = this.api + 'absences/requests/' + id;
        var post = {
          "start_date": start_date,
          "end_date": end_date,
          "reason": reason
        }
        this.HttpClient.put<SuccessResponseType>(url,
        post,  {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
        }).subscribe(res => {
          if(!res.success){
            swal("Oops!", "Errore durante l'operazione!", "error");
            if(res.error){
              console.log(res.error);
            }
            return;
          }
          if(fileList && fileList.length > 0){
            this.upload_justification_file(id,fileList);
          }else
          swal("Fatto!", "La richiesta è stata modificata correttamente", "success");
          dialog.close();
        },err =>{
          swal("Oops!", "Errore durante l'operazione!", "error");
          console.log(err);
          return;
        });
      }

      refuse_request(id){
        swal({
          title: "Conferma",
          text: "Vuoi davvero rifiutare la richiesta per questo permesso?",
          icon: "warning",
          dangerMode: true,
        })
        .then(willDelete => {
          if (willDelete) {
            var url = this.api + "absences/requests/refuse/" + id;
            this.HttpClient.put<SuccessResponseType>(url,{},
            {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
            }).subscribe(res => {
              if(!res.success){
                swal("Oops!", "Errore durante l'operazione!", "error");
                if(res.error){
                  console.log(res.error);
                }
                return;
              }
              swal("Fatto!", "Richiesta Rifiutata", "success");
            },err =>{
              swal("Oops!", "Errore durante l'operazione!", "error");
              console.log(err);
              return;
            });
          }
        });
      }

    reset_employees_requests_version(){
        this.employees_requests_version = "";
    }

    reset_employees_version(){
      this.employees_version = "";
    }

    reset_myrequests_version(){
      this.my_requests_version = "";
    }

    send_request(reason,start_date, end_date, fileList){
    start_date.setTime(start_date.getTime() + (2*60*60*1000));
    end_date.setTime(end_date.getTime() + (2*60*60*1000));
    var url = this.api + "absences/requests";
    var post = {
      "start_date": start_date,
      "end_date": end_date,
      "reason": reason
    }
    this.HttpClient.post<AddRequestResponseType>(url,
    post,  {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
    }).subscribe(res => {
      if(!res.success){
        swal("Oops!", "Errore durante l'invio della richiesta!", "error");
        if(res.error){
          console.log(res.error);
        }
        return;
      }
      if(fileList && fileList.length > 0){
        this.upload_justification_file(res.request_id,fileList);
      }else
      swal("Fatto!", "La richiesta è stata inviata correttamente", "success");
    },err =>{
      swal("Oops!", "Errore durante l'operazione!", "error");
      console.log(err);
      return;
    });
  }

  upload_justification_file(id, fileList){
    let file: File = fileList[0];
    let fileSize:number=fileList[0].size;
    if(fileSize<=10485760){
    let formData:FormData = new FormData();
    formData.append('filetoupload',file);
    var url = this.api + "absences/requests/" + id + "/upload_justification";
    this.HttpClient.put<SuccessResponseType>(url,
    formData,  {headers: new HttpHeaders().set('Authorization', "bearer " + this.UserService.get_token()),
    }).subscribe(res => {
      if(!res.success){
        swal("Oops!", "Errore durante l'upload del file!", "error");
        if(res.error){
          console.log(res.error);
          return;
        }
      }
      swal("Fatto!", "La richiesta è stata inviata correttamente", "success");
    },err =>{
      swal("Oops!", "Errore durante l'upload del file!", "error");
      console.log(err);
      return;
    });
    }
  }
}
