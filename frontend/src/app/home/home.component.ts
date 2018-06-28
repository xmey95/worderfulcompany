import { Component } from "@angular/core";
import { UserService } from "../user.service";

/**
 * This component just contains the cards to enter one of the 3 sections of the app (absences, rooms, surveys)
 */
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent {
  constructor(private UserService: UserService) {}
}
