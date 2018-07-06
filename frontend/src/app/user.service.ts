import { BlockScrollService } from "./block-scroll.service";
import {
  BossResponseType,
  LogResponseType,
  RegisterResponseType,
  SuccessResponseType,
  SupervisionsResponseType,
  SupervisionType,
  UserResponseType,
  UsersResponseType,
  UserType,
  VersionResponseType
} from "./interfaces";
import { CookieService } from "ngx-cookie-service";
import { filter, map, share, switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { interval, Observable } from "rxjs";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material";
import { Router } from "@angular/router";
import swal from "sweetalert";
import * as config from "./config.json";

/**
 *This service can be used for the user-related funtionality like login, logout, token and user info management.
 */
@Injectable()
export class UserService {
  private api: string; //api base url
  private logged_in: boolean = false;
  public user: UserType; //Info of the user ( null if not logged in)
  public token: string; //Authentication Token of the user (null if not logged in)
  public users$: Observable<UserType[]>; //observable to get user list
  public supervisions$: Observable<SupervisionType[]>; //observable for supervisions list
  private users_version = ""; //version code for user list
  private supervisions_version = ""; //version code for supervision list
  private supervisions: SupervisionType[] = []; //list of supervisions couples (id_user, id_boss)
  private users: UserType[] = []; //list of users

  /**
   * The constructor creates 2 observables to get the lists of users and supervisions from backend
   */
  constructor(
    private BlockScrollService: BlockScrollService,
    private cookieService: CookieService,
    private httpClient: HttpClient,
    public snackBar: MatSnackBar,
    private Router: Router
  ) {
    this.api = (<any>config).api;
    this.load_cookies();
    //NOTE: components that use some observable must implement ngOnDestroy and call unsubscribe() on subscription object
    //Observable to get Users List
    this.users$ = interval(1000).pipe(
      switchMap(() =>
        this.httpClient.get<VersionResponseType>(this.api + "users/true")
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version === this.users_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        this.users_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.httpClient.get<UsersResponseType>(this.api + "users/false")
      ),
      map(data => {
        return data.users;
      }), //save new value (get just users field from response)
      share()
    );
    //Observable to get Supervisions List
    this.supervisions$ = interval(1000).pipe(
      switchMap(() =>
        this.httpClient.get<VersionResponseType>(this.api + "supervisions/true")
      ), //this request gets version code
      filter((data: VersionResponseType) => {
        if (data.version === this.supervisions_version) {
          return false; //stop stream for this iteration, value has not changed from last check
        }
        this.supervisions_version = data.version;
        return true;
      }),
      switchMap(() =>
        this.httpClient.get<SupervisionsResponseType>(
          this.api + "supervisions/false"
        )
      ),
      map(data => {
        return data.supervisions;
      }), //save new value (get just supervisions field from response)
      share()
    );
    //subscribe to this observable to refresh user list every second
    this.users$.subscribe(users => {
      this.users = users;
    });
    //subscribe to this observable to refresh supervisions list every second
    this.supervisions$.subscribe(supervisions => {
      this.supervisions = supervisions;
    });
  }

  /**
   * This function is called when user compiles the form for add a new user
   */
  add_user(user) {
    this.httpClient
      .post<RegisterResponseType>(this.api + "users", user)
      .subscribe(
        data => {
          if (data.success) {
            //insertion succesfully
            swal(
              "Inserimento Riuscito!",
              "Utente salvato correttamente!",
              "success"
            );
          } else {
            //insertion failed, error message shown in snackBar
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            if (data.error) {
              console.log(data.error);
            }
            this.snackBar.open(
              "Inserimento non riuscito! Errore inaspettato nel server...",
              "OK",
              config
            );
          }
        },
        err => {
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open(
            "Inserimento non riuscito! Errore inaspettato nel server...",
            "OK",
            config
          );
          console.log(err);
        }
      );
  }

  /**
   *This function is used by users management component to show boss complete name (name + surname) for each user (if it's set)
   */
  get_boss_name(id_employee) {
    //search for user in supervisions list
    for (var i = 0; i < this.supervisions.length; i++) {
      if (this.supervisions[i].id_user == id_employee) {
        //user found
        for (var j = 0; j < this.users.length; j++) {
          //look for the boss in user list
          if (this.users[j].id == this.supervisions[i].id_boss) {
            return this.users[j].name + " " + this.users[j].surname;
          }
        }
      }
    }
    return ""; //requested user has no boss set
  }

  get_login_status() {
    //user and token must be set
    if (this.user && this.token && this.logged_in == true) return true;
    return false;
  }

  /**
   * Get complete name (name + surname) of the user
   */
  get_name() {
    if (this.get_login_status() == true) {
      return this.user.name + " " + this.user.surname;
    } else {
      return "Impiegato";
    }
  }

  /**
   * Get info of the user
   */
  get_user() {
    return this.user;
  }

  /**
   * Return info of the user selected by his id, if not found returns info of the logged-in user
   */
  get_user_by_id(id) {
    var me;
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].id == id) return this.users[i];
      if (this.users[i].id == this.user.id) me = this.users[i];
    }
    return me;
  }

  /**
   * Get users list holded by user-service instance
   */
  get_users() {
    return this.users;
  }

  /**
   * If set, return the authentication token
   */
  get_token() {
    if (this.logged_in && this.token) {
      return this.token;
    }
    return "";
  }

  /**
   * This method checks if cookies are set, if they are load them
   */
  load_cookies() {
    if (
      this.cookieService.check("user") &&
      this.cookieService.check("token") &&
      this.cookieService.check("logged_in") &&
      this.cookieService.get("logged_in") == "true"
    ) {
      //load saved values from cookies
      this.user = JSON.parse(this.cookieService.get("user"));
      this.token = this.cookieService.get("token");
      this.logged_in = true;
    } else {
      this.Router.navigate(["/home"]);
    }
  }

  /**
   * This Method uses swal to show a confirm modal, and if the user click 'ok' clears login data and cookies
   */
  logout() {
    swal({
      //use swal to show a confirm modal
      title: "Conferma",
      text: "Vuoi davvero uscire?",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        //willDelete is true if user clicked 'ok'
        this.token = null;
        this.user = null;
        this.logged_in = false;
        this.cookieService.deleteAll(); //clear login data and cookies
      }
    });
    this.Router.navigate(["/home"]);
  }

  /**
   * This method is called when a new subscription to users$ observable is registered, it forces to send the value even this has not changed, so new subscribers can get the value
   */
  reset_version() {
    this.users_version = ""; //setting version code in this way the value will be sent in observable flow in next check for changes
  }

  /**
   * Saves Login data in cookies
   */
  save_cookies() {
    this.cookieService.set("logged_in", "true");
    this.cookieService.set("token", this.token);
    this.cookieService.set("user", JSON.stringify(this.user));
  }

  /**
   * Sends a request to backend to add/update supervision entry for specified employee/boss couple
   */
  set_boss(id_user, id_boss, bottomsheetref) {
    var post = { user: id_user, boss: id_boss };
    this.httpClient
      .post<SuccessResponseType>(this.api + "users/set_boss/", post)
      .subscribe(
        data => {
          if (data.success) {
            //login succesfully
            swal(
              "Nomina Riuscita!",
              "Supervisione salvata correttamente!",
              "success"
            );
          } else {
            //login failed
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            if (data.error) {
              console.log(data.error);
            }
            this.snackBar.open(
              "Inserimento non riuscito! Errore inaspettato del server...",
              "OK",
              config
            );
          }
        },
        err => {
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open(
            "Inserimento non riuscito! Errore inaspettato del server...",
            "OK",
            config
          );
          console.log(err);
        }
      );
    bottomsheetref.dismiss(); //close bottom sheet (boss choosing list) after sending the request
  }

  /**
   * Sends authentication request to backend, providing credentials got through the login form
   */
  try_login(email, password) {
    this.httpClient
      .get<LogResponseType>(this.api + "authenticate", {
        headers: new HttpHeaders().set(
          "Authorization",
          "Basic " + btoa(email + ":" + password)
        ) //basic authentication, base-64 encoded string <email>:<password>
      })
      .subscribe(
        data => {
          if (data.success) {
            //login succesfully
            this.token = data.token;
            this.user = data.user;
            this.logged_in = true;
            this.save_cookies();
            this.BlockScrollService.enable(); //scroll is disabled while login modal is shown, after login we can enable it
          } else {
            //login failed
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            this.snackBar.open(
              "Login non riuscito! Credenziali non valide...",
              "OK",
              config
            );
          }
        },
        err => {
          //login failed
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open(
            "Login non riuscito! Credenziali non valide...",
            "OK",
            config
          );
          console.log(JSON.stringify(err));
        }
      );
  }
}
