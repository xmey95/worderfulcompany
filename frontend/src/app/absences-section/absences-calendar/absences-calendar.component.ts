import { Component, Inject, OnDestroy } from '@angular/core';
import { startOfDay, endOfDay, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { Subscription } from 'rxjs';
import { CalendarEvent, CalendarEventAction } from 'angular-calendar';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';
import { RequestsService } from '../requests.service';
import { UserService } from '../../user.service';
import { RequestType } from '../../interfaces';
import * as config from '../../config.json';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  grey: {
    primary: '#888888',
    secondary: '#aaaaaa'
  },
  green: {
    primary: '#21ad21',
    secondary: '#e3fae3'
  }
};

@Component({
  selector: 'absences-calendar',
  templateUrl: './absences-calendar.component.html',
  styleUrls: ['./absences-calendar.component.css']
})
export class AbsencesCalendarComponent implements OnDestroy{
  private requests: RequestType[]; //list of all request made by any of the employees
  private requestsSubscription: Subscription;
  private events: CalendarEvent[];
  private viewDate: Date = new Date();
  private activeDayIsOpen: boolean = true;
  private state_filter: number = -1;

  constructor(public dialog: MatDialog, private RequestsService: RequestsService, private UserService: UserService) {
    //subscription to observable to get requests list from requests-service
    this.requestsSubscription = this.RequestsService.all_requests$.subscribe((data)=>{
      this.requests = data;
      this.make_event_list();
    });
    this.RequestsService.reset_all_requests_version();//force observable to emit data in the stream even if it has not changed from last check
  }

  make_event_list(){
    var res = [];
    var user;
    var color;
    for(var i = 0; i < this.requests.length; i++){
      if(this.state_filter != -1 && this.requests[i].state != this.state_filter) continue;
      user = this.UserService.get_user_by_id(this.requests[i].id_user);
      switch(this.requests[i].state){
        case 0:
          color = colors.grey
          break;
        case 1:
          color = colors.green
          break;
        case 2:
          color = colors.red
          break;
      }
      res.push({
        start: startOfDay(new Date(this.requests[i].start_date)),
        end: endOfDay(new Date(this.requests[i].end_date)),
        title: user.surname + ' ' + user.name,
        request: this.requests[i],
        color: color
      });
    }
    this.events = res;
  }

  //Handler for clicks on a day of the calendar
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false; //close event list if it was opened for the clicked day
      } else {
        this.activeDayIsOpen = true; //open the list
        this.viewDate = date; //select the clicked day
      }
    }
  }

  //method to open modify-request dialog form, injecting into it the data of the selected request
  openDialog(request): void {
     let dialogRef = this.dialog.open(RequestDetailsComponent, {
       data: { request: request }
     });
   }

  show_request(event){
    this.openDialog(event.request);
  }

  ngOnDestroy() {
    //unsubscription from requests-service observable
    this.requestsSubscription.unsubscribe();
  }
}

/*
  This is the dialog component, it contains the info of the selected request
*/
@Component({
  selector: 'request-details',
  templateUrl: 'request-details/request-details.component.html',
  styleUrls: ['request-details/request-details.component.css']
})
export class RequestDetailsComponent {
  private api: string;
  constructor(public dialogRef: MatDialogRef<RequestDetailsComponent>,@Inject(MAT_DIALOG_DATA) public data: {request: RequestType}, private UserService: UserService) {
    this.api = (<any>config).api;
  }

  get_user_name(){
    var user = this.UserService.get_user()
    return user.surname + ' ' + user.name;
  }

  get_state_label(state){
    if(state == 1) return 'Approvata';
    if(state == 2) return 'Rifiutata';
    return 'In Attesa di Conferma';
  }

  get_state_label_class(state){
    if(state == 1) return 'green';
    if(state == 2) return 'red';
    return 'grey';
  }

  //User clicked ok button, close the dialog
  close(): void {
    this.dialogRef.close();
  }
}
