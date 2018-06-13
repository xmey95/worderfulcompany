import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  side_expanded: boolean = false;

  constructor(){

  }
  toggle_sidebar(){
    this.side_expanded = !this.side_expanded;
  }

}
