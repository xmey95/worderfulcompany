import {Component, Input, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router/'
import { interval } from 'rxjs';
/*
Components of the sidebar menu
*/

//Structure of an Element of Sidebar Menu
interface menuItem{
  name: string;
  short_name:string;
  sub_menu: string[][];
}

//This component is an Element of restricted sidebar menu (desktop-only)
@Component({
  selector: 'mini-sidebar-item',
  templateUrl: 'mini-sidebar-item.component.html',
  styleUrls: ['./mini-sidebar-item.component.css']
})
export class MiniSidebarItem {
  @Input() item: menuItem; //data of the menu entry to be shown
  active: boolean = false; //if true the submenu is shown

  constructor(private _elementRef : ElementRef, private Router: Router) {

  }

  //The Listener is used to handle every click on the window, and if the element clicked is not this menu-item the sub-menu is closed
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
      const clickedInside = this._elementRef.nativeElement.contains(targetElement); //check if element is clicked
      if (!clickedInside) {
        this.active=false; //close sub-menu if click is external to this component
      }
  }

  //Get class of icon to be shown for this menu entry
  get_icon(){
    if(this.item.name == "Sezione Assenze") return "fas fa-calendar-times";
    if(this.item.name == "Sezione Aule") return "fas fa-chalkboard-teacher";
    return "fas fa-question";
  }

  //check if current route is in the section of this item, so it can be displayed as active
  get_section_active(){
    var parts = this.Router.url.split('/');
    if(parts[1] == "absences" && this.item.short_name=="Assenze")return true;
    if(parts[1] == "surveys" && this.item.short_name=="Sondaggi")return true;
    if(parts[1] == "rooms" && this.item.short_name=="Aule")return true;
    return false;
  }
}

/*
---------------------------------------------------------------------------------------------------------------------------------------
*/

//This component is an Element of expanded-sidebar menu
@Component({
  selector: 'sidebar-menu-item',
  templateUrl: 'sidebar-menu-item.component.html',
  styleUrls: ['./sidebar-menu-item.component.css']
})
export class SidebarMenuItem {
  @Input() item: menuItem; //data of the menu entry to be shown
  active: boolean = false; //if true the submenu is visible
  @Output() toggle = new EventEmitter(); //emitter to outer component to order the change of sidebar status
  constructor(private Router: Router) {
  }

  //function called when a submenu item is clicked, it hides sidebar in mobile devices
  collapse_if_mobile(){
    if(window.screen.width <= 766){
      this.toggle.emit();
    }
  }
  //check if current route is in the section of this item, so it can be displayed as active
  get_section_active(){
    var parts = this.Router.url.split('/');
    if(parts[1] == "absences" && this.item.short_name=="Assenze")return true;
    if(parts[1] == "surveys" && this.item.short_name=="Sondaggi")return true;
    if(parts[1] == "rooms" && this.item.short_name=="Aule")return true;
    return false;
  }

}

/*
---------------------------------------------------------------------------------------------------------------------------------------
*/

//The whole sidebar-menu component, it contains components of type SidebarMenuItem and MiniSidebarItem and inject data in them
@Component({
  selector: 'sidebar-body',
  templateUrl: 'sidebar-body.component.html',
  styleUrls: ['./sidebar-body.component.css']
})
export class SidebarBodyComponent {
  private today: number = Date.now(); //date to be displayed in extended sidebar
  @Input() side_extended: boolean; //input from outer component (sidebar status)
  items: menuItem[] = []; //List of menu items to be injected in inner components
  @Output() toggle = new EventEmitter(); //emitter to outer component to order the change of sidebar status
  constructor(private UserService: UserService, private Router: Router) {
    interval(1000).subscribe(()=>{
      this.today = Date.now(); //refresh datetime every second
    });

    //Build the list of data object to be injected in menu-item components
    var obj = { //first item, absences section
      "name": "Sezione Assenze",
      "short_name": "Assenze",
      "sub_menu": [
        ["Calendario", "absences/calendar"],
        ["Le tue Richieste", "/absences/myabsences"],
        ["Richieste (amministratore)", "/absences/employees"]
      ]
    }
    this.items.push(obj);

    obj = { //second item, rooms section
      "name": "Sezione Aule",
      "short_name": "Aule",
      "sub_menu": [
        ["Aule (amministratore)", ""],
        ["Le tue prenotazioni", ""],
        ["Prenota Aula", ""],
        ["Tutte le Aule", ""]
      ]
    }
    this.items.push(obj);

    obj = { //third item, surveys section
      "name": "Sezione Sondaggi",
      "short_name": "Sondaggi",
      "sub_menu": [
        ["Crea Sondaggio", ""],
        ["Sondaggi (amministratore)", ""],
        ["Tutti i Sondaggi", ""]
      ]
    }
    this.items.push(obj);
  }

  //order to outer component to change sidebar status
  emit_toggle(){
    this.toggle.emit();
  }

  //order to outer component to change sidebar status (just for mobile devices)
  emit_toggle_if_mobile(){
    if(window.screen.width <= 766){
      this.toggle.emit();
    }
  }

}
