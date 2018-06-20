import { Component, OnDestroy } from '@angular/core';
import { RequestsService } from '../requests.service';
import { RequestType, UserType } from '../../interfaces';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

/*
  This component contains the dashboard for bosses in wich they can see some statistic based on all the requests made by their employees and see a list of their own employees
*/

@Component({
  selector: 'employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnDestroy {
  private employees: UserType[]; //list of employees
  private requests: RequestType[]; //list of all request made by any of the employees
  private employeesSubscription: Subscription; //subscription to observable to get employees list from requests-service
  private requestsSubscription: Subscription; //subscription to observable to get requests list from requests-service
  constructor(private RequestsService: RequestsService){

    //subscription to observable to get employees list from requests-service
    this.employeesSubscription = this.RequestsService.employees$.subscribe((data)=>{
      this.employees = data;
    });
    this.RequestsService.reset_employees_version();//force observable to emit data in the stream even if it has not changed from last check

    //subscription to observable to get requests list from requests-service
    this.requestsSubscription = this.RequestsService.employees_requests$.subscribe((data)=>{
      this.requests = data;
    });
    this.RequestsService.reset_employees_requests_version();//force observable to emit data in the stream even if it has not changed from last check
  }

  //get the number of requests made by specified employee (displayed in the user list)
  get_requests_number(id){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i<this.requests.length; i++){
      if(this.requests[i].id_user == id) count++;
    }
    return count;
  }

  //get the number of pending requests made by specified employee (displayed in the user list)
  get_pending_requests_number(id){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i<this.requests.length; i++){
      if(this.requests[i].id_user == id && this.requests[i].state == 0) count++;
    }
    return count;
  }

  ngOnDestroy() {
    //unsubsription from requests-service observables
    this.employeesSubscription.unsubscribe();
    this.requestsSubscription.unsubscribe();
  }

}
