import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { LogResponseType, UserType, UsersResponseType, VersionResponseType } from './interfaces'
import * as config from './config.json';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { BlockScrollService } from './block-scroll.service';

/*
This service can be used for the user-ralted funtionality like login, logout, token and user info management.
*/

@Injectable()
export class UserService {
    private logged_in: boolean = false;
    private api : string; //api base url
    public user: UserType; //Info of the user ( null if not logged in)
    public token:string; //Authentication Token of the user (null if not logged in)
    public users$: Observable<UserType[]>;//observable to get user list
    private users_version = ""; //version code for user list

    constructor(private BlockScrollService: BlockScrollService, private httpClient: HttpClient, private cookieService: CookieService, public snackBar: MatSnackBar) {
        this.api = (<any>config).api;
        this.load_cookies();
        //Observable to get Users List is defined here
        //NOTE: components that use this observable must implement ngOnDestroy and call unsubscribe() on subscription object
        this.users$ = interval(3000)
            .pipe(
                switchMap(() => this.httpClient.get<VersionResponseType>(this.api + 'users/true')), //this request gets version code
                filter((data: VersionResponseType) => {
                    if (data.version === this.users_version) {
                        return false; //stop stream for this iteration, value has not changed from last check
                    }
                    this.users_version = data.version;
                    return true;
                }),
                switchMap(() => this.httpClient.get<UsersResponseType>(this.api + 'users/false')),
                map((data)=>{ return data.users }), //save new value (get just users field from response)
                share()
            );
    }

    get_login_status(){
        //user and token must be set
        if(this.user && this.token && this.logged_in == true) return true;
        return false;
    }

    //get complete name (name + surname) of the user
    get_name(){
      if(this.get_login_status() == true){
        return this.user.name + " " + this.user.surname
      }else{
        return "Impiegato";
      }
    }

    load_cookies(){
        //check if cookies are set
        if(this.cookieService.check('user') && this.cookieService.check('token') && this.cookieService.check('logged_in') && this.cookieService.get('logged_in') == "true"){
            //load saved values from cookies
            this.user = JSON.parse(this.cookieService.get('user'));
            this.token = this.cookieService.get('token');
            this.logged_in = true;
        }
    }

    logout(){
        this.token = null;
        this.user = null;
        this.logged_in = false;
        this.cookieService.deleteAll(); //clear cookies
    }

    save_cookies(){
        this.cookieService.set( 'logged_in', 'true' );
        this.cookieService.set( 'token', this.token );
        this.cookieService.set( 'user', JSON.stringify(this.user) );
    }

    //send authentication request to backend, providing credentials got through the login form
    try_login(email, password){
      this.httpClient.get<LogResponseType>(this.api + 'authenticate', {
      headers: new HttpHeaders().set('Authorization', "Basic " + btoa(email + ':' + password)), //basic authentication, base-64 encoded string <email>:<password>
    }).subscribe(data=> {
        if(data.success){ //login succesfully
          this.token = data.token;
          this.user = data.user;
          this.logged_in = true;
          this.save_cookies();
          this.BlockScrollService.enable(); //scroll is disabled while login modal is shown, after login we can enable it
        }
        else{ //login failed
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            this.snackBar.open("Login non riuscito! Credenziali non valide...", "OK", config);
        }
      },
      err =>{ //login failed
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open("Login non riuscito! Credenziali non valide...", "OK", config);
          console.log(JSON.stringify(err));
      });
    }
}
