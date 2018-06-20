import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { UserType } from '../interfaces'
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';

/*
This component contains the table showing a complete list of users (name,surname,email, boss)
*/
@Component({
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent implements OnDestroy {
  @Output() ready = new EventEmitter<number>(); //output to indicate to outer component if data is ready, it contains length of users list
  @Output() set_boss = new EventEmitter<UserType>();
  private displayedColumns = ['name', 'surname', 'email', 'boss'];
  private dataSource; //data source for datatable
  private usersSubscription: Subscription;

  constructor(client: HttpClient, private UserService: UserService) {
    if(window.screen.width <= 766){
      this.displayedColumns = ['name', 'surname', 'boss']; //email column is not whown in mobile devices
    }
    this.usersSubscription = this.UserService.users$.subscribe((users) => { //subscription to user-service's observable to get user list
        this.dataSource = new MatTableDataSource(users); //inject received data in the table
        if(users.length == 0){ //emit query status to outer component
          this.ready.emit(0); //no user found
        }else{
          this.ready.emit(users.length); //data is ready, table can be displayed
        }
    });
    this.UserService.reset_version();
  }

  //filter function for datatable NOTE: code got from Angular Material
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  //execute unsubscription from user-service's observable
  ngOnDestroy() {
    this.usersSubscription.unsubscribe();
  }

  //emit to outer component wich user has been clicked in order to start boss assigment procedure
  emit_employee(user){
    this.set_boss.emit(user);
  }
}
