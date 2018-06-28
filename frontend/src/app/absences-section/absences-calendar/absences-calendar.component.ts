import { Component, Inject, OnDestroy } from "@angular/core";
import {
  startOfDay,
  endOfDay,
  endOfMonth,
  isSameDay,
  isSameMonth
} from "date-fns";
import { Subscription } from "rxjs";
import { CalendarEvent, CalendarEventAction } from "angular-calendar";
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA
} from "@angular/material";
import { RequestsService } from "../requests.service";
import { UserService } from "../../user.service";
import { RequestType } from "../../interfaces";
import * as config from "../../config.json";

//colors for absence indicators, it changes according to request's state
const colors: any = {
  red: {
    //refused requests
    primary: "#ad2121",
    secondary: "#FAE3E3"
  },
  grey: {
    //pending requests
    primary: "#888888",
    secondary: "#aaaaaa"
  },
  green: {
    //approved requests
    primary: "#21ad21",
    secondary: "#e3fae3"
  }
};

/**
 * Absences calendar, for every day are displayed all the approved, refused and pending requests for absences
 *
 * NOTE: Component base code got from angular-calendar: https://mattlewis92.github.io/angular-calendar/docs/
 */
@Component({
  selector: "absences-calendar",
  templateUrl: "./absences-calendar.component.html",
  styleUrls: ["./absences-calendar.component.css"]
})
export class AbsencesCalendarComponent implements OnDestroy {
  private requests: RequestType[]; //list of all request made by any of the employees
  private requestsSubscription: Subscription;
  private events: CalendarEvent[]; //Type of event-item to be injected in the calendar
  private viewDate: Date = new Date(); //selected date
  private activeDayIsOpen: boolean = true; //If true the list of absences for the active day is shown
  private state_filter: number = -1; //value of the state filter (-1 means no filter)

  /**
   * The constructor registers a new subscription to RequestsService's observable to get the list of all the absence requests in the company
   */
  constructor(
    public dialog: MatDialog,
    private RequestsService: RequestsService,
    private UserService: UserService
  ) {
    //subscription to observable to get requests list from requests-service
    this.requestsSubscription = this.RequestsService.all_requests$.subscribe(
      data => {
        this.requests = data;
        this.make_event_list(); //Generate the list for the calendar for requests list
      }
    );
    this.RequestsService.reset_all_requests_version(); //force observable to emit data in the stream even if it has not changed from last check
  }

  /**
   * Handler for clicks on a day of the calendar, if opens/closes dayly-absence list for the clicked day
   */
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false; //close event list if it was opened for the clicked day
      } else {
        this.activeDayIsOpen = true; //open the list
        this.viewDate = date; //select the clicked day
      }
    }
  }

  /**
   * This method gets a list of requests and maps it into an CalendarEvent List that can be used as input for the calendar
   */
  make_event_list() {
    var res = [];
    var user;
    var color;
    for (var i = 0; i < this.requests.length; i++) {
      if (
        this.state_filter != -1 &&
        this.requests[i].state != this.state_filter
      )
        continue;
      user = this.UserService.get_user_by_id(this.requests[i].id_user);
      switch (
        this.requests[i].state //Set the color according to the state of the request
      ) {
        case 0:
          color = colors.grey;
          break;
        case 1:
          color = colors.green;
          break;
        case 2:
          color = colors.red;
          break;
      }
      res.push({
        //New CalendarEvent object
        start: startOfDay(new Date(this.requests[i].start_date)),
        end: endOfDay(new Date(this.requests[i].end_date)),
        title: user.surname + " " + user.name,
        request: this.requests[i],
        color: color
      });
    }
    this.events = res;
  }

  /**
   * Unsubscription from requests-service observable
   */
  ngOnDestroy() {
    this.requestsSubscription.unsubscribe();
  }

  /**
   * This opens request-details dialog, data of the selected request are injected into it
   */
  openDialog(event): void {
    let dialogRef = this.dialog.open(RequestDetailsComponent, {
      data: { request: event.request }
    });
  }
}

/**
 * This is the dialog component, it contains the info of the selected request
 */
@Component({
  selector: "request-details",
  templateUrl: "request-details/request-details.component.html",
  styleUrls: ["request-details/request-details.component.css"]
})
export class RequestDetailsComponent {
  private api: string;
  constructor(
    public dialogRef: MatDialogRef<RequestDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: RequestType },
    private UserService: UserService
  ) {
    this.api = (<any>config).api;
  }

  /**
   * Get the complete name of the user thet made the request
   */
  get_user_name() {
    var user = this.UserService.get_user_by_id(this.data.request.id_user);
    return user.surname + " " + user.name;
  }

  /**
   * Get the label to be displayed according to the request state
   */
  get_state_label(state) {
    if (state == 1) return "Approvata";
    if (state == 2) return "Rifiutata";
    return "In Attesa di Conferma";
  }

  /**
   * Get the class to change the color of request indicator according to the request state
   */
  get_state_label_class(state) {
    if (state == 1) return "green";
    if (state == 2) return "red";
    return "grey";
  }

  /**
   * Method called when user clicks 'ok' button, just closes the dialog
   */
  close(): void {
    this.dialogRef.close();
  }
}
