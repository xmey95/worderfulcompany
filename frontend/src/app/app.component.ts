import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { UserService } from "./user.service";
import { BlockScrollService } from "./block-scroll.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "wonderfulcompany";
  side_expanded: boolean = false; //track sidebar status, it can be expanded or collapsed (hidden on mobile devices)

  constructor(
    client: HttpClient,
    private BlockScrollService: BlockScrollService,
    private UserService: UserService
  ) {}

  /**
   * Checks if user is logged in, if not, login modal will be shown over the page (no operation is allowed to a non-logged user)
   */
  get_login_status() {
    return this.UserService.get_login_status();
  }

  /**
   * Toggle sidebar mode (collapsed/expanded)
   */
  toggle_sidebar() {
    this.side_expanded = !this.side_expanded;

    if (window.screen.width <= 766) {
      if (this.side_expanded == true) {
        //disable scroll on mobile devices if sidebar is expanded
        this.BlockScrollService.disable();
      } else {
        //enable scroll if sidebar is collapsed
        this.BlockScrollService.enable();
      }
    }
  }
}
