import { Component, OnDestroy } from "@angular/core";
import { RequestsService } from "../requests.service";
import { RequestType, UserType } from "../../interfaces";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

/**
 * This component contains the dashboard for bosses in wich they can see some statistic based on all the requests made by their employees and see a list of their own employees
 */
@Component({
  selector: "employees",
  templateUrl: "./employees.component.html",
  styleUrls: ["./employees.component.css"]
})
export class EmployeesComponent implements OnDestroy {
  private employees: UserType[]; //list of employees
  private requests: RequestType[]; //list of all request made by any of the employees
  private employeesSubscription: Subscription; //subscription to observable to get employees list from requests-service
  private requestsSubscription: Subscription; //subscription to observable to get requests list from requests-service

  /**
   * The constructor subscribes to RequestsService Observables to get employees list and the list of all their requests
   */
  constructor(private RequestsService: RequestsService) {
    //subscription to observable to get employees list from requests-service
    this.employeesSubscription = this.RequestsService.employees$.subscribe(
      data => {
        this.employees = this.sort_employees(data);
      }
    );
    this.RequestsService.reset_employees_version(); //force observable to emit data in the stream even if it has not changed from last check

    //subscription to observable to get requests list from requests-service
    this.requestsSubscription = this.RequestsService.employees_requests$.subscribe(
      data => {
        this.requests = data;
      }
    );
    this.RequestsService.reset_employees_requests_version(); //force observable to emit data in the stream even if it has not changed from last check
  }

  /**
   * Get the number of requests made by specified employee (displayed in the user list)
   */
  get_requests_number(id) {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].id_user == id) count++;
    }
    return count;
  }

  /**
   * Get the number of pending requests made by specified employee (displayed in the user list)
   */
  get_pending_requests_number(id) {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].id_user == id && this.requests[i].state == 0)
        count++;
    }
    return count;
  }

  /**
   * Unsubscription from requests-service observables
   */
  ngOnDestroy() {
    this.employeesSubscription.unsubscribe();
    this.requestsSubscription.unsubscribe();
  }

  /**
   * Simple name sorting applied to Employees List when received from RequestsService's observable flow
   */
  sort_employees(employees) {
    var found = true;
    var temp;
    while (found == true) {
      found = false;
      for (var i = 0; i < employees.length - 1; i++) {
        if (
          employees[i].surname < employees[i + 1].surname ||
          (employees[i].surname == employees[i + 1].surname &&
            employees[i].name < employees[i + 1].name)
        ) {
          found = true;
          temp = employees[i];
          employees[i] = employees[i + 1];
          employees[i + 1] = temp;
        }
      }
    }
    return employees;
  }
}
