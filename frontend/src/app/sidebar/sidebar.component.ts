import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() side_expanded:boolean;
  @Output() toggle = new EventEmitter(); //emitter to outer component to order the change of sidebar status
  constructor() { }

  //order to outer component to change sidebar status
  toggle_sidebar(){
    this.toggle.emit();
  }
}
