import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { RequestsService } from "../requests.service";
import { RequestType, UserType } from "../../interfaces";
import { UserService } from "../../user.service";
import { Subscription } from "rxjs";

/**
 * This component is the overview of the data related to a specific user.
 *
 * In this page the boss of the user specified in the queryparams can approve or refuse his absence-requests and see some statistics about this employee
 */
@Component({
  selector: "app-employee",
  templateUrl: "./employee.component.html",
  styleUrls: ["./employee.component.css"]
})
export class EmployeeComponent implements OnDestroy {
  private employee_requestsSubscription: Subscription; //subscription to requests-service observable to get the list of the requests made by any of the employees of the logged-in user
  private api: string; //api base url
  private employee: UserType; //info of the employee
  private employee_requests: RequestType[]; //requests of the specific employee
  private filter: number = -1; //parameter to filter requests by the state

  /**
   * The constructor gets the info of the selected employee from UserService and subscribe to RequestsService observable to get all employees requests, when data is received, filters it to get just the requests of the selected employee
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private RequestsService: RequestsService,
    private UserService: UserService
  ) {
    this.route.queryParams.subscribe(params => {
      //get the id of the employee from route queryparams
      if (!params["employee"]) {
        this.router.navigate(["/home"]); //no user to display, redirect to home
      } else {
        //subscription to requests-service observable to get requests list and filter it to get the requests of the specific employee
        this.employee_requestsSubscription = this.RequestsService.employees_requests$.subscribe(
          data => {
            //get info of the employee from UserService
            this.employee = this.UserService.get_user_by_id(params["employee"]);
            var array = [];
            for (var i = 0; i < data.length; i++) {
              if (data[i].id_user == this.employee.id) {
                //the request is made by the employee
                array.push(data[i]);
              }
            }
            this.employee_requests = array; //filtered array
          }
        );
        this.RequestsService.reset_employees_requests_version(); //force observable to emit data in the stream even if it has not changed from last check
      }
    });
  }

  /**
   * Get the number of requests currently diplayed requests considering the effect of state filter
   */
  displayed_requests() {
    if (!this.employee_requests) return 0;
    if (!this.filter || this.filter == -1) return this.employee_requests.length;
    var count = 0;
    for (var i = 0; i < this.employee_requests.length; i++) {
      if (this.employee_requests[i].state == this.filter) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get the label to be displayed to show the state of the request in the template
   */
  get_state_label(state) {
    if (state == 0) {
      return "In attesa di approvazione";
    }
    if (state == 1) {
      return "Approvata";
    }
    if (state == 2) {
      return "Rifiutata";
    }
  }

  /**
   * Unsubscription from requests-service observable to get employees requests
   */
  ngOnDestroy() {
    this.employee_requestsSubscription.unsubscribe();
  }
}
