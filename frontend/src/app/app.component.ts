import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { BlockScrollService } from './block-scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wonderfulcompany';
  side_expanded: boolean = false;

  constructor(client: HttpClient, private BlockScrollService: BlockScrollService, private UserService: UserService){
    this.get_login_status();
  }

  get_login_status(){
    return this.UserService.get_login_status();
  }

  toggle_sidebar(){
    this.side_expanded = !this.side_expanded;
    if(window.screen.width <= 766){
      if(this.side_expanded == true){
        this.BlockScrollService.disable();
      }else{
        this.BlockScrollService.enable();
      }
    }
  }

}
