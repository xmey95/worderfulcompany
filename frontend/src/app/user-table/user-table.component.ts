import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { UserType } from '../interfaces'
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';

/*
This component contains the table showing a complete list of users (name,surnem,email)
*/
@Component({
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent implements OnDestroy {
  @Output() ready = new EventEmitter<number>(); //output to indicate to outer component if data is ready [1] or not[0] (or no user is found[2])
  private displayedColumns = ['name', 'surname', 'email'];
  private dataSource; //data source for datatable
  private usersSubscription: Subscription;

  constructor(client: HttpClient, private UserService: UserService) {
    this.usersSubscription = this.UserService.users$.subscribe((users) => { //subscription to user-service's observable to get user list
        this.dataSource = new MatTableDataSource(users); //inject recieved data in the table
        if(users.length == 0){ //emit query status to outer component
          this.ready.emit(2); //no user found
        }else{
          this.ready.emit(1); //data is ready, table can be displayed
        }
    });
  }

  //execute unsubscription from user-service's observable
  ngOnDestroy() {
    this.usersSubscription.unsubscribe()
  }

  //filter function for datatable NOTE: code got from Angular Material
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
