import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { RequestsService } from '../requests.service';
import { RequestType, UserType } from '../../interfaces';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnDestroy {
  private employee_requestsSubscription: Subscription;
  private api: string; //api base url
  private employee: UserType;
  private employee_requests: RequestType[];
  private filter: number = -1;
  constructor(private route: ActivatedRoute, private router: Router, private RequestsService: RequestsService, private UserService: UserService) {
    this.route.queryParams.subscribe(params => {
      if(!params['employee']){
        this.router.navigate(['/home']);
      }else{
        this.employee_requestsSubscription = this.RequestsService.employees_requests$.subscribe((data)=>{
          this.employee=this.UserService.get_user_by_id(params['employee']);
          var array = [];
          for (var i=0; i < data.length; i++){
            if(data[i].id_user == this.employee.id){
              array.push(data[i]);
            }
          }
          this.employee_requests = array;
        });
        this.RequestsService.reset_employees_requests_version();
      }
    });
  }

  displayed_requests(){
    if(!this.employee_requests) return 0;
    if(!this.filter || this.filter == -1) return this.employee_requests.length;
    var count = 0;
    for(var i = 0; i< this.employee_requests.length; i++){
      if(this.employee_requests[i].state == this.filter){
        count++;
      }
    }
    return count;
  }

  get_state_label(state){
    if(state == 0){
      return 'In attesa di approvazione';
    }
    if(state == 1){
      return 'Approvata';
    }
    if(state == 2){
      return 'Rifiutata';
    }
  }

  ngOnDestroy() {
    this.employee_requestsSubscription.unsubscribe();
  }

}
