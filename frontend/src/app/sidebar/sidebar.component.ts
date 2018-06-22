import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() side_expanded:boolean; //Input from appcomponent to get sidebar status (collapsed/expanded)
  @Output() toggle = new EventEmitter(); //emitter to outer component to order the change of sidebar status
  constructor() { }

  /**
   * Emits an output to outer component in ordrd to change sidebar status
   */
  toggle_sidebar(){
    this.toggle.emit();
  }
}
