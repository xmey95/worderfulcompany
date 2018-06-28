import { Component, Inject } from "@angular/core";
import { UserService } from "../user.service";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet,
  MatBottomSheetRef
} from "@angular/material";
import { UserType } from "../interfaces";
import { Subscription } from "rxjs";

/**
 * This component is used to show a list of users in order to make user chose new boss for previously selected user (data of the selected user (employee) are injected from outer component)
 *
 * NOTE: base component code got from Angular Material
 */
@Component({
  selector: "bottom-list",
  templateUrl: "./bottom-list.component.html"
})
export class BottomListComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<BottomListComponent>,
    private UserService: UserService
  ) {}

  /**
   * When user selects new boss from the list this function is called to send a request to backend
   */
  set_boss(id_user, id_boss) {
    //UserService's set_boss method is called, component ref is passed to allow to close this list after the submission of the request to the backend
    this.UserService.set_boss(id_user, id_boss, this.bottomSheetRef);
  }
}

/**
 * Users Management page, in this page the user can add new users, set boss for any user and see a complete list of users
 */
@Component({
  selector: "manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.css"]
})
export class ManageUsersComponent {
  private showPassword: boolean = false;
  private showPassword2: boolean = false;

  //fields of add-user form
  public number: number;
  public name: string;
  public surname: string;
  public email: string;
  public password: string;
  public password2: string;

  constructor(
    private bottomSheet: MatBottomSheet,
    private UserService: UserService
  ) {}

  /**
   * This function is called when submit button of the form is clicked
   */
  add_user() {
    var user = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password
    };
    //UserService's add_user method is called
    this.UserService.add_user(user);

    //clear form
    this.name = null;
    this.surname = null;
    this.email = null;
    this.password = null;
    this.password2 = null;
  }

  /**
   * Method used in the template to show the total number of users
   */
  get_number() {
    if (this.number) {
      return "(" + this.number + ")";
    } else return "";
  }

  /**
   * This function is called when set_boss button is clicked for some user in the table, it opens the bottom-list for boss selection
   */
  openBottomSheet(employee) {
    var array = this.UserService.get_users(); //full list of users got from UserService
    var users = [];
    for (var i = 0; i < array.length; i++) {
      //remove selected user (employee) from list to inject it in bottom list for boss selection
      if (array[i].id != employee.id) {
        users.push(array[i]);
      }
    }

    //open the bottom list for allow user to choose boss for previously selected user
    this.bottomSheet.open(BottomListComponent, {
      data: { employee: employee, users: users } //selected user info are injected to the bottom list (boss selection)
    });
  }

  /**
   * Control for password fields (they have to hold the same value)
   */
  password_confirmed() {
    if (this.password != this.password2) {
      if (
        !(
          (!this.password && this.password == "") ||
          (this.password == "" && !this.password)
        )
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handler for inner component (user-table) emission: the emitted values is the number of users
   */
  set_number(val) {
    this.number = val;
  }

  /**
   * Makes password field's content visible or make it hidden again
   */
  toggle_show_password() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Makes password2 field's content visible or make it hidden again
   */
  toggle_show_password2() {
    this.showPassword2 = !this.showPassword2;
  }

  /**
   * Simple validation for add-user form, all fields must be not null and passwords must be equals
   */
  validate() {
    if (
      !this.name ||
      !this.password ||
      !this.email ||
      !this.surname ||
      this.name == "" ||
      this.surname == "" ||
      this.email == "" ||
      this.password == ""
    ) {
      return false;
    }
    if (this.password != this.password2) {
      return false;
    }
    return true;
  }
}
