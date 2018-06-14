import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, map, share, filter } from 'rxjs/operators';
import { UserType, VersionResponseType, UsersResponseType } from './interfaces'
import * as config from './config.json';

@Injectable()
export class UserService {
    private api : string; //api base url
    public user: UserType; //Info of the user ( null if not logged in)
    public token:string; //Authentication Token of the user (null if not logged in)
    public users$: Observable<UserType[]>;//observable to get user list
    private users_version = ""; //version code for user list

    constructor(private httpClient: HttpClient) {
        this.api = (<any>config).api;
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
                map((data)=>{ return data.users }),
                share()
            );
    }

    get_login_status(){
        if(this.user && this.token) return true;
        return false;
    }
}
