import { Component, Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, interval } from "rxjs";
import { switchMap, map, share, filter } from "rxjs/operators";
import {
  AddRequestResponseType,
  SuccessResponseType,
  RequestType,
  RequestsResponseType,
  UserType,
  UsersResponseType,
  VersionResponseType
} from "../interfaces";
import * as config from "../config.json";
import swal from "sweetalert";
import { UserService } from "../user.service";

/**
 * This service can be used for all the absence-related funtionality. It's methods sends propr requests to backend to get and update values in the database
 */
@Injectable()
export class RequestsService {
  private api: string; //api base url
  public all_requests$: Observable<RequestType[]>;
  private all_requests_version = ""; //version code for all_requests list
  public myrequests$: Observable<RequestType[]>;
  private my_requests_version = ""; //version code for myrequests list
  public employees$: Observable<UserType[]>;
  private employees_version = ""; //version code for myrequests list
  public employees_requests$: Observable<RequestType[]>;
  private employees_requests_version = ""; //version code for myrequests list

  /**
   * The constructor creates 4 observables to get the lists of all requests, the list of employees, the list of employees requests and the list of logged-in user's requests from backend
   */
  constructor(
    private HttpClient: HttpClient,
    private UserService: UserService
  ) {
    this.api = (<any>config).api;

    //Observable to get the list of all request made by any of the users
    this.all_requests$ = interval(2000).pipe(
      switchMap(() =>
        this.HttpClient.get<VersionResponseType>(
          this.api + "absences/requests/true",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            ) //set authentication header with thoken got from UserService
          }
        )
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version === this.all_requests_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        //data has changed, refresh version code
        this.all_requests_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.HttpClient.get<RequestsResponseType>(
          this.api + "absences/requests/false",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ),
      map(data => {
        return data.requests;
      }), //save new value (get just requests field from response)
      share()
    );

    //Observable to get the list of the requests of the User
    this.myrequests$ = interval(2000).pipe(
      switchMap(() =>
        this.HttpClient.get<VersionResponseType>(
          this.api + "absences/myrequests/true",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            ) //set authentication header with thoken got from UserService
          }
        )
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version === this.my_requests_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        //data has changed, refresh version code
        this.my_requests_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.HttpClient.get<RequestsResponseType>(
          this.api + "absences/myrequests/false",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ),
      map(data => {
        return data.requests;
      }), //save new value (get just requests field from response)
      share()
    );

    //Observable to get the list of the employees of the User
    this.employees$ = interval(1000).pipe(
      switchMap(() =>
        this.HttpClient.get<VersionResponseType>(
          this.api + "absences/employees/true",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version === this.employees_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        this.employees_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.HttpClient.get<UsersResponseType>(
          this.api + "absences/employees/false",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ),
      map(data => {
        return data.users;
      }), //get new value (get just users field from response)
      share()
    );

    //Observable to get the list of the requests made by any of the employees of the User
    this.employees_requests$ = interval(1000).pipe(
      switchMap(() =>
        this.HttpClient.get<VersionResponseType>(
          this.api + "absences/employees/requests/true",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version == this.employees_requests_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        //data has changed, refresh version code
        this.employees_requests_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.HttpClient.get<RequestsResponseType>(
          this.api + "absences/employees/requests/false",
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        )
      ),
      map(data => {
        return data.requests;
      }), //get new value (get just requests field from response)
      share()
    );
  }

  /**
   * Uses Swal to show a confirm modal and, if users clicks 'ok' approves a request made by one of the employees of the user
   */
  approve_request(id) {
    swal({
      //use swal to show a confirm modal
      title: "Conferma",
      text: "Vuoi davvero approvare la richiesta per questo permesso?",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        //willDelete is true if user clicked 'ok'
        var url = this.api + "absences/requests/approve/" + id;

        //http request to backend (with authorization header containing the token got from UserService)
        this.HttpClient.put<SuccessResponseType>(
          url,
          {},
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        ).subscribe(
          res => {
            if (!res.success) {
              swal("Oops!", "Errore durante l'operazione!", "error");
              if (res.error) {
                console.log(res.error);
              }
              return;
            }
            swal("Fatto!", "Richiesta Approvata", "success");
          },
          err => {
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          }
        );
      }
    });
  }

  /**
   * Uses Swal to show a confirm modal and, if users clicks 'ok' cancel a pending request made by the user
   */
  cancel_request(id) {
    swal({
      //use swal to show a confirm modal
      title: "Conferma",
      text: "Vuoi davvero annullare la richiesta per questo permesso?",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        //willDelete is true if user clicked 'ok'
        var url = this.api + "absences/requests/" + id;
        //http request to backend (with authorization header containing the token got from UserService)
        this.HttpClient.delete<SuccessResponseType>(url, {
          headers: new HttpHeaders().set(
            "Authorization",
            "bearer " + this.UserService.get_token()
          )
        }).subscribe(
          res => {
            if (!res.success) {
              swal("Oops!", "Errore durante l'operazione!", "error");
              if (res.error) {
                console.log(res.error);
              }
              return;
            }
            swal("Fatto!", "Richiesta Eliminata", "success");
          },
          err => {
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          }
        );
      }
    });
  }

  /**
   * Modify data of a request
   */
  modify_request(id, reason, start_date, end_date, fileList, dialog) {
    //add 2 hours to collected datetimes to compensate the timezone gap
    start_date.setTime(start_date.getTime() + 2 * 60 * 60 * 1000);
    end_date.setTime(end_date.getTime() + 2 * 60 * 60 * 1000);

    var url = this.api + "absences/requests/" + id;
    //new data for the request
    var post = {
      start_date: start_date,
      end_date: end_date,
      reason: reason
    };
    //http request to backend (with authorization header containing the token got from UserService)
    this.HttpClient.put<SuccessResponseType>(url, post, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      res => {
        if (!res.success) {
          swal("Oops!", "Errore durante l'operazione!", "error");
          if (res.error) {
            console.log(res.error);
          }
          return;
        }
        if (fileList && fileList.length > 0) {
          this.upload_justification_file(id, fileList);
        } else
          swal(
            "Fatto!",
            "La richiesta è stata modificata correttamente",
            "success"
          );
        dialog.close();
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
  }

  /**
   * Uses Swal to show a confirm modal and, if users clicks 'ok' refuses a request made by one of the employees of the user
   */
  refuse_request(id) {
    swal({
      //use swal to show a confirm modal
      title: "Conferma",
      text: "Vuoi davvero rifiutare la richiesta per questo permesso?",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        //willDelete is true if user clicked 'ok'
        var url = this.api + "absences/requests/refuse/" + id;
        //http request to backend (with authorization header containing the token got from UserService)
        this.HttpClient.put<SuccessResponseType>(
          url,
          {},
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "bearer " + this.UserService.get_token()
            )
          }
        ).subscribe(
          res => {
            if (!res.success) {
              swal("Oops!", "Errore durante l'operazione!", "error");
              if (res.error) {
                console.log(res.error);
              }
              return;
            }
            swal("Fatto!", "Richiesta Rifiutata", "success");
          },
          err => {
            swal("Oops!", "Errore durante l'operazione!", "error");
            console.log(err);
            return;
          }
        );
      }
    });
  }

  /**
   * This method is called when a new subscription to all_requests observable is registered, it forces to send the value even this has not changed by setting version code to '', so new subscribers can get the value
   */
  reset_all_requests_version() {
    this.all_requests_version = "";
  }

  /**
   * This method is called when a new subscription to employees requests observable is registered, it forces to send the value even this has not changed by setting version code to '', so new subscribers can get the value
   */
  reset_employees_requests_version() {
    this.employees_requests_version = "";
  }

  /**
   * This method is called when a new subscription to employees observable is registered, it forces to send the value even this has not changed by setting version code to '', so new subscribers can get the value
   */
  reset_employees_version() {
    this.employees_version = "";
  }

  /**
   * This method is called when a new subscription to my_requests observable is registered, it forces to send the value even this has not changed by setting version code to '', so new subscribers can get the value
   */
  reset_myrequests_version() {
    this.my_requests_version = "";
  }

  /**
   * This method submits a new absence-request to the backend
   */
  send_request(reason, start_date, end_date, fileList) {
    //add 2 hours to collected datetimes to compensate the timezone gap
    start_date.setTime(start_date.getTime() + 2 * 60 * 60 * 1000);
    end_date.setTime(end_date.getTime() + 2 * 60 * 60 * 1000);
    var url = this.api + "absences/requests";
    //new request's data
    var post = {
      start_date: start_date,
      end_date: end_date,
      reason: reason
    };
    //http request to backend (with authorization header containing the token got from UserService)
    this.HttpClient.post<AddRequestResponseType>(url, post, {
      headers: new HttpHeaders().set(
        "Authorization",
        "bearer " + this.UserService.get_token()
      )
    }).subscribe(
      res => {
        if (!res.success) {
          swal("Oops!", "Errore durante l'invio della richiesta!", "error");
          if (res.error) {
            console.log(res.error);
          }
          return;
        }
        //if some justification file has been uploaded call upload_justification_file method to send it to storage
        if (fileList && fileList.length > 0) {
          this.upload_justification_file(res.request_id, fileList);
        } else
          swal(
            "Fatto!",
            "La richiesta è stata inviata correttamente. Riceverai una mail di conferma quando la tua richiesta verrà approvata o rifuitata",
            "success"
          );
      },
      err => {
        swal("Oops!", "Errore durante l'operazione!", "error");
        console.log(err);
        return;
      }
    );
  }

  /**
   * This method uploads a justification file in the backend server storage
   */
  upload_justification_file(id, fileList) {
    let file: File = fileList[0];
    let fileSize: number = fileList[0].size;

    if (fileSize <= 10485760) {
      //10Mb size max
      //create formdata to send the file in the request
      let formData: FormData = new FormData();
      formData.append("filetoupload", file); //append file from filelist in the formdata
      var url = this.api + "absences/requests/" + id + "/upload_justification";

      //http request to backend (with authorization header containing the token got from UserService)
      this.HttpClient.put<SuccessResponseType>(url, formData, {
        headers: new HttpHeaders().set(
          "Authorization",
          "bearer " + this.UserService.get_token()
        )
      }).subscribe(
        res => {
          if (!res.success) {
            swal("Oops!", "Errore durante l'upload del file!", "error");
            if (res.error) {
              console.log(res.error);
              return;
            }
          }
          swal(
            "Fatto!",
            "La richiesta è stata inviata correttamente",
            "success"
          );
        },
        err => {
          swal("Oops!", "Errore durante l'upload del file!", "error");
          console.log(err);
          return;
        }
      );
    }
  }
}
