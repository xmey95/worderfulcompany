import {Component, Input} from '@angular/core';

interface menuItem{
  name: string;
  short_name:string;
  sub_menu: string[][];
}

@Component({
  selector: 'sidebar-menu-item',
  templateUrl: 'sidebar-menu-item.component.html',
  styleUrls: ['./sidebar-menu-item.component.css']
})
export class SidebarMenuItem {
  @Input() item: menuItem;
  active: boolean = false;
  constructor() {
  }
}

@Component({
  selector: 'mini-sidebar-item',
  templateUrl: 'mini-sidebar-item.component.html',
  styleUrls: ['./mini-sidebar-item.component.css']
})
export class MiniSidebarItem {
  @Input() item: menuItem;
  active: boolean = false;
  constructor() {
  }

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
