import { Component, OnDestroy } from '@angular/core';
import { RequestsService } from '../requests.service';
import { RequestType, UserType } from '../../interfaces';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnDestroy {
  private employees: UserType[];
  private requests: RequestType[];
  private employeesSubscription: Subscription;
  private requestsSubscription: Subscription;
  constructor(private RequestsService: RequestsService){
    this.employeesSubscription = this.RequestsService.employees$.subscribe((data)=>{
      this.employees = data;
    });
    this.RequestsService.reset_employees_version();

    this.requestsSubscription = this.RequestsService.employees_requests$.subscribe((data)=>{
      this.requests = data;
    });
    this.RequestsService.reset_employees_requests_version();
  }

  get_requests_number(id){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i<this.requests.length; i++){
      if(this.requests[i].id_user == id) count++;
    }
    return count;
  }

  ngOnDestroy() {
    this.employeesSubscription.unsubscribe();
    this.requestsSubscription.unsubscribe();
  }

}
