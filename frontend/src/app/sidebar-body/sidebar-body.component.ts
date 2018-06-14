import {Component, Input, ElementRef, HostListener} from '@angular/core';

//Structure of an Element of Sidebar Menu
interface menuItem{
  name: string;
  short_name:string;
  sub_menu: string[][];
}

//Element of expanded sidebar menu
@Component({
  selector: 'sidebar-menu-item',
  templateUrl: 'sidebar-menu-item.component.html',
  styleUrls: ['./sidebar-menu-item.component.css']
})
export class SidebarMenuItem {
  @Input() item: menuItem; //the menu entry to be shown
  active: boolean = false; //if true the submenu is shown
  constructor() {
  }
}

//Element of restricted sidebar menu
@Component({
  selector: 'mini-sidebar-item',
  templateUrl: 'mini-sidebar-item.component.html',
  styleUrls: ['./mini-sidebar-item.component.css']
})
export class MiniSidebarItem {
  @Input() item: menuItem; //the menu entry to be shown
  active: boolean = false; //if true the submenu is shown

  constructor(private _elementRef : ElementRef) {
  }

  //The Listener is used to notice a click on the window, and if the element clicked is not this component the sub-menu become closed
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
      const clickedInside = this._elementRef.nativeElement.contains(targetElement);
      if (!clickedInside) {
        this.active=false;
      }
  }

  //Get class of icon to be shown for each menu entry
  get_icon(){
    if(this.item.name == "Sezione Assenze") return "fas fa-calendar-times";
    if(this.item.name == "Sezione Aule") return "fas fa-chalkboard-teacher";
    return "fas fa-question";
  }
}

@Component({
  selector: 'sidebar-body',
  templateUrl: 'sidebar-body.component.html',
  styleUrls: ['./sidebar-body.component.css']
})
export class SidebarBodyComponent {
  @Input() side_extended: boolean;
  items: menuItem[] = [];

  constructor() {
    var obj = {
      "name": "Sezione Assenze",
      "short_name": "Assenze",
      "sub_menu": [
        ["Calendario", ""],
        ["Le tue Richieste", ""],
        ["Richieste (amministratore)", ""]
      ]
    }
    this.items.push(obj);
    obj = {
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
    obj = {
      "name": "Sezione Sondaggi",
      "short_name": "Sondaggi",
      "sub_menu": [
        ["Crea Sondaggio", ""],
        ["Sondaggi (amministratore)", ""],
        ["Tutti i Sondaggi", ""]
      ]
    }
    this.items.push(obj);

    obj = {
      "name": "Gestione Utenti",
      "short_name": "Utenti",
      "sub_menu": [
        ["Inserimento Utente", ""],
        ["Lista Utenti", ""],
        ["Gestori Sondaggi", ""],
        ["Responsabili Assenze", ""]
      ]
    }
    this.items.push(obj);

  }

}
