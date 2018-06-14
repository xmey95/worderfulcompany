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

  set_ready(val){
    this.ready=val;
  }

}
