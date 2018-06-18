import { Component, Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { BossResponseType, LogResponseType, RegisterResponseType, SuccessResponseType, SupervisionType, SupervisionsResponseType, UserResponseType, UserType, UsersResponseType, VersionResponseType } from './interfaces'
import * as config from './config.json';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar, MatSnackBarConfig, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BlockScrollService } from './block-scroll.service';
import  swal from 'sweetalert';
/*
This service can be used for the user-related funtionality like login, logout, token and user info management.
*/

@Injectable()
export class UserService {
    private logged_in: boolean = false;
    private api : string; //api base url
    public user: UserType; //Info of the user ( null if not logged in)
    public token:string; //Authentication Token of the user (null if not logged in)
    public users$: Observable<UserType[]>;//observable to get user list
    public supervisions$: Observable<SupervisionType[]>; //observable for supervisions list
    private users_version = ""; //version code for user list
    private supervisions_version = ""; //version code for supervision list
    private supervisions : SupervisionType[] = [];//list of supervisions couples (id_user, id_boss)
    private users: UserType[] = [];//list of users
    constructor(private BlockScrollService: BlockScrollService, private cookieService: CookieService, public dialog: MatDialog, private httpClient: HttpClient, public snackBar: MatSnackBar) {
        this.api = (<any>config).api;
        this.load_cookies();
        //NOTE: components that use some observable must implement ngOnDestroy and call unsubscribe() on subscription object
        //Observable to get Users List
        this.users$ = interval(1000)
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
            //Observable to get Supervisions List
            this.supervisions$ = interval(1000)
                .pipe(
                    switchMap(() => this.httpClient.get<VersionResponseType>(this.api + 'supervisions/true')), //this request gets version code
                    filter((data: VersionResponseType) => {
                        if (data.version === this.supervisions_version) {
                            return false; //stop stream for this iteration, value has not changed from last check
                        }
                        this.supervisions_version = data.version;
                        return true;
                    }),
                    switchMap(() => this.httpClient.get<SupervisionsResponseType>(this.api + 'supervisions/false')),
                    map((data)=>{ return data.supervisions }), //save new value (get just supervisions field from response)
                    share()
                );

         //subscribe to this observable to refresh user list every second
         this.users$.subscribe((users)=>{
             this.users = users;
         });
         //subscribe to this observable to refresh supervisions list every second
         this.supervisions$.subscribe((supervisions)=>{
             this.supervisions = supervisions;
         });
    }

    //This function is called when user compiles the form for add a new user
    add_user(user){
      this.httpClient.post<RegisterResponseType>(this.api + 'users', user)
      .subscribe(data=> {
          if(data.success){ //insertion succesfully
            swal("Inserimento Riuscito!", "Utente salvato correttamente!", "success");
          }
          else{ //insertion failed, error message shown in snackBar
              let config = new MatSnackBarConfig();
              config.duration = 2000;
              if(data.error){
                  console.log(data.error);
              }
              this.snackBar.open("Inserimento non riuscito! Errore inaspettato nel server...", "OK", config);
          }
      }, err =>{
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          this.snackBar.open("Inserimento non riuscito! Errore inaspettato nel server...", "OK", config);
          console.log(err);
      });
    }

    //show a confirm modal and if user clicks 'ok' executes logout
    logout_confirm(): void {
      let dialogRef = this.dialog.open(ConfirmComponent, {
        width: '250px'
      });

      dialogRef.afterClosed().subscribe(result => { //callback from dialg closure
        console.log('The dialog was closed');
        if(result){ //callback data, undefined if user doesn't click on 'ok' button
          this.token = null;
          this.user = null;
          this.logged_in = false;
          this.cookieService.deleteAll(); //clear login data and cookies
        }
      });
    }

    //This function is used by users management component to show boss complete name (name + surname) for each user (if it's set)
    get_boss_name(id_employee){
        //search for user in supervisions list
        for (var i = 0; i < this.supervisions.length; i++){
            if(this.supervisions[i].id_user == id_employee){ //user found
                for(var j = 0; j < this.users.length; j++){ //look for the boss in user list
                    if(this.users[j].id == this.supervisions[i].id_boss){
                        return this.users[j].name + ' ' + this.users[j].surname;
                    }
                }
            }
        }
        return ""; //requested user has no boss set
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

    //get info of the user
    get_user(){
      return this.user;
    }

    //return info of the user selected through his id
    get_user_by_id(id){
      var me;
      for (var i = 0; i < this.users.length; i++){
        if (this.users[i].id == id)return this.users[i];
        if(this.users[i].id == this.user.id) me = this.users[i];
      }
      return me;
    }

    //get users list holded by userservice instance
    get_users(){
        return this.users;
    }

    get_token(){
      if(this.logged_in && this.token){
        return this.token;
      }
      return "";
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
      this.logout_confirm();
    }

    //This request is called when a new subscription to users$ observable is registered, it forces to send the value even this has not changed, so new subscribers can get the value
    reset_version(){
      this.users_version = ""; //setting version code in this way the value will be sent in observable flow in next check for changes
    }

    save_cookies(){
        this.cookieService.set( 'logged_in', 'true' );
        this.cookieService.set( 'token', this.token );
        this.cookieService.set( 'user', JSON.stringify(this.user) );
    }

    //Send request to backend to add/update supervision entry for specified user with specified boss
    set_boss(id_user, id_boss, bottomsheetref){
        var post = {"user":id_user, "boss": id_boss};
        this.httpClient.post<SuccessResponseType>(this.api + 'users/set_boss/', post)
        .subscribe(data=> {
            if(data.success){ //login succesfully
              swal("Nomina Riuscita!", "Supervisione salvata correttamente!", "success");
            }
            else{ //login failed
                let config = new MatSnackBarConfig();
                config.duration = 2000;
                if(data.error){
                    console.log(data.error);
                }
                this.snackBar.open("Inserimento non riuscito! Errore inaspettato del server...", "OK", config);
            }
        }, err =>{
            let config = new MatSnackBarConfig();
            config.duration = 2000;
            this.snackBar.open("Inserimento non riuscito! Errore inaspettato del server...", "OK", config);
            console.log(err);
        });
        bottomsheetref.dismiss(); //close bottom sheet previously shown to allow user to chose the boss
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


//Modal confirm box used to gat a confirm from user who wants to log out
@Component({
  selector: 'confirm',
  templateUrl: 'confirm/confirm.component.html',
})
export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
      this.dialogRef.close();
    }

}
