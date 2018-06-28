import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UserService } from "../user.service";

/**
 * This component is the top navbar of the page
 */
@Component({
  selector: "header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent {
  @Input() side_expanded: boolean; //track sidebar status, logo is shown when sidebar is collapsed
  @Output() toggle = new EventEmitter(); //emitter to outer component to order the change of sidebar status
  constructor(private UserService: UserService) {}

  /**
   * Emits output to outer component in order to change sidebar status
   */
  toggle_sidebar() {
    this.toggle.emit();
  }

  /**
   * Uses login service to logout, login modal will be displayed over the page
   */
  logout() {
    this.UserService.logout();
  }
}
