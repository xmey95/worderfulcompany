import { Component } from '@angular/core';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  public ready: number = 0;
  constructor() {
  }

  //handler for inner component (user-table) emission: [0]=> show loader; [1]=>show table, [2] => no user found, show message
  set_ready(val){
    this.ready=val;
  }

}
