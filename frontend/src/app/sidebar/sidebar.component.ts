import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() side_expanded:boolean;
  @Output() toggle = new EventEmitter();
  constructor() { }

  toggle_sidebar(){
    this.toggle.emit();
  }
}
