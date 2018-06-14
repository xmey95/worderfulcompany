import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() side_expanded:boolean;
  @Output() toggle = new EventEmitter();
  constructor(private UserService : UserService) { }

  toggle_sidebar(){
    this.toggle.emit();
  }

  logout(){
    this.UserService.logout();
  }

}
