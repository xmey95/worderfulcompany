import { Component } from '@angular/core';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  public number: number;
  constructor() {
  }

  //handler for inner component (user-table) emission: it contains the number of users
  set_number(val){
    this.number=val;
  }

  get_number(){
    if(this.number){
      return '(' + this.number + ')';
    }
    else return "";
  }


}
