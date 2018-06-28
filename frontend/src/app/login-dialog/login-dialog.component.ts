import { Component } from "@angular/core";
import { BlockScrollService } from "../block-scroll.service";
import { UserService } from "../user.service";

/**
 * This component is the modal containing the login form, it's shown over the page when user is not logged-in (no operation is allowed to a non-logged-in user)
 */
@Component({
  selector: "login-dialog",
  templateUrl: "./login-dialog.component.html",
  styleUrls: ["./login-dialog.component.css"]
})
export class LoginDialogComponent {
  private showPassword: boolean = false;

  //login form inputs
  private email: string;
  private password: string;

  /**
   * The constructor just uses the BlockScrollService to disable scroll whand login dialog is shown
   */
  constructor(
    private BlockScrollService: BlockScrollService,
    private UserService: UserService
  ) {
    this.BlockScrollService.disable(); //scroll is disabled when this modal is shown over the page
  }

  /**
   * makes password field's content visible or make it hidden again
   */
  toggle_show_password() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Uses login service to try log in with the credentials inserted by the user in the form
   */
  try_login() {
    this.UserService.try_login(this.email, this.password);
  }

  /**
   * Simple validation of email and password values: they must not be empty, this control is used to disable button in login form
   */
  validate() {
    if (this.email && this.password) {
      if (this.email != "" && this.password != "") {
        return true;
      }
    }
    return false;
  }
}
