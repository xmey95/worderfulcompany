import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { UserType } from '../interfaces'
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';

@Component({
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent implements OnDestroy {
  @Output() ready = new EventEmitter();
  private displayedColumns = ['name', 'surname', 'email'];
  private usersSubscription: Subscription;
  private dataSource;

  constructor(client: HttpClient, private UserService: UserService) {
    this.usersSubscription = this.UserService.users$.subscribe((users) => {
        this.dataSource = new MatTableDataSource(users);
        if(users.length == 0){
          this.ready.emit(2);
        }else{
          this.ready.emit(1);
        }
    });
  }

  ngOnDestroy() {
    this.usersSubscription.unsubscribe()
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

}
