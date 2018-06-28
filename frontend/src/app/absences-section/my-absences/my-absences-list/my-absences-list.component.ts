import { Component, Inject, OnDestroy } from "@angular/core";
import { RequestsService } from "../../requests.service";
import { Subscription } from "rxjs";
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA
} from "@angular/material";
import { RequestType } from "../../../interfaces";
import * as config from "../../../config.json";
import swal from "sweetalert";

/*
  This component contains the list of the requests made by the logged-in user
*/
@Component({
  selector: "my-absences-list",
  templateUrl: "./my-absences-list.component.html",
  styleUrls: ["./my-absences-list.component.css"]
})
export class MyAbsencesListComponent implements OnDestroy {
  private api: string; //api base url
  private myrequests: RequestType[]; //list of the requests
  private filter: number = -1; //parameter to filter requests by the state
  private myrequestsSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private RequestsService: RequestsService
  ) {
    this.api = (<any>config).api;

    //subscription to requests-service's observable to get myrequests list
    this.myrequestsSubscription = this.RequestsService.myrequests$.subscribe(
      requests => {
        this.myrequests = requests; //save received data
      }
    );

    //force observable to emit data in the stream even if it has not changed from last check
    this.RequestsService.reset_myrequests_version();
  }

  //get the number of displayed requests considering the effect of the state filter
  displayed_requests() {
    if (!this.myrequests) return 0;
    if (!this.filter || this.filter == -1) return this.myrequests.length;
    var count = 0;
    for (var i = 0; i < this.myrequests.length; i++) {
      if (this.myrequests[i].state == this.filter) {
        count++;
      }
    }
    return count;
  }

  //used in the template to show the total number of users
  get_number() {
    if (this.myrequests) {
      return "(" + this.myrequests.length + ")";
    } else return "";
  }

  //Get the label to be displayed to show the state of the request
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

  ngOnDestroy() {
    //unsubscription from requests-service observable
    this.myrequestsSubscription.unsubscribe();
  }

  //method to open modify-request dialog form, injecting into it the data of the selected request
  openDialog(request): void {
    let dialogRef = this.dialog.open(ModifyRequestComponent, {
      data: { request: request }
    });
  }
}

/*
  This is the dialog component, it contains the form to modify a request
*/
@Component({
  selector: "modify-request",
  templateUrl: "modify-request/modify-request.component.html",
  styleUrls: ["modify-request/modify-request.component.css"]
})
export class ModifyRequestComponent {
  //data of the request, binded to form inputs
  private start_date: Date;
  private end_date: Date;
  private reason: string;
  private custom_reason: string;
  private fileList: FileList;

  constructor(
    public dialogRef: MatDialogRef<ModifyRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: RequestType },
    private RequestsService: RequestsService
  ) {
    //set form data equals to selected request data
    this.start_date = new Date(this.data.request.start_date);
    this.end_date = new Date(this.data.request.end_date);

    if (
      this.data.request.reason == "ferie" ||
      this.data.request.reason == "malattia" ||
      this.data.request.reason == "studio"
    ) {
      this.reason = this.data.request.reason;
      this.custom_reason = null;
    } else {
      this.reason = "other";
      this.custom_reason = this.data.request.reason;
    }
  }

  //User discarded changes, just close the dialog
  cancelClick(): void {
    this.dialogRef.close();
  }

  //get changes from file input
  fileChange(event) {
    this.fileList = event.target.files;
  }

  //Call requests-service method to modify the request after a confirm check
  save_changes() {
    //if reason is not standard set it to custom reason
    var reason = this.reason == "other" ? this.custom_reason : this.reason;

    //use swal to show confirm box
    swal({
      title: "Conferma",
      text: "Salvare le modifiche apportate alla richiesta?",
      icon: "warning",
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        //willDelete is true if user clicked ok
        this.RequestsService.modify_request(
          this.data.request.id,
          reason,
          this.start_date,
          this.end_date,
          this.fileList,
          this.dialogRef
        );
        return;
      }
    });
  }

  //validation of form data
  validate() {
    //end_date must be after start_date
    if (this.end_date && !(this.end_date >= this.start_date)) return false;

    //absence reason must be set
    if (!this.reason) return false;
    if (
      this.reason == "other" &&
      (!this.custom_reason || this.custom_reason == "")
    )
      return false;

    //check if some data has been modified
    var old_start_date = new Date(this.data.request.start_date);
    var old_end_date = new Date(this.data.request.end_date);
    if (this.end_date.getTime() != old_end_date.getTime()) return true;
    if (this.start_date.getTime() != old_start_date.getTime()) return true;
    if (
      this.data.request.reason != "malattia" &&
      this.data.request.reason != "ferie" &&
      this.data.request.reason != "studio" &&
      this.data.request.reason != "other"
    ) {
      if (
        this.reason != "other" ||
        this.custom_reason != this.data.request.reason
      )
        return true;
    }
    if (
      this.reason != this.data.request.reason &&
      (this.data.request.reason == "malattia" ||
        this.data.request.reason == "ferie" ||
        this.data.request.reason == "studio")
    )
      return true;
    if (this.fileList && this.fileList.length > 0) return true;

    //no data has been modified, unvalidate form
    return false;
  }
}
