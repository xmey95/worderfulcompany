import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() side_expanded:boolean;
  @Output() toggle = new EventEmitter();
  constructor() { }

  toggle_sidebar(){
    this.toggle.emit();
  }
}
