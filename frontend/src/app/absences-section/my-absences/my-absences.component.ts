import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import * as config from "../../config.json";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RequestsService } from "../requests.service";
import { UserService } from "../../user.service";
import swal from "sweetalert";

/**
 * This component shows a list of the absence-request made by the logged-in user, and contains a form to submit new requests
 */
@Component({
  selector: "my-absences",
  templateUrl: "./my-absences.component.html",
  styleUrls: ["./my-absences.component.css"]
})
export class MyAbsencesComponent {
  private api: string; //api base url
  private start_date: Date = new Date(); //start_date of the request
  private end_date: Date; //end date of the request
  private reason: string; //reason for the absence
  private custom_reason: string; //a non-standard reason
  private fileList: FileList; //fileList to upload justification file for the request
  constructor(
    private HttpClient: HttpClient,
    private RequestsService: RequestsService,
    private UserService: UserService
  ) {
    this.api = (<any>config).api;
    //we need just the date, not the time
    this.start_date.setHours(0, 0, 0, 0);
  }

  /**
   * Handles file selection from file input by putting selected files in the fileList object
   */
  fileChange(event) {
    this.fileList = event.target.files;
  }

  /**
   * Collects data from inputs and call request-service's method to submit a new absence-request
   */
  send_request() {
    //check if reason is a custom reason
    var reason = this.reason == "other" ? this.custom_reason : this.reason;

    //check if end_date is set, otherwise set end date = start date
    var end_date = this.end_date ? this.end_date : this.start_date;

    //call requests-service method to submit request
    this.RequestsService.send_request(
      reason,
      this.start_date,
      end_date,
      this.fileList
    );

    //clear form
    this.start_date = new Date();
    this.end_date = null;
    this.reason = null;
    this.custom_reason = null;
    this.fileList = null;
  }

  /**
   * Validation of input data, end date, if set, must be after the start date, the absence period must be less than 180 days and a reason must be set
   */
  validate() {
    //if set, end_date must be after the start_date
    if (this.end_date && !(this.end_date >= this.start_date)) return false;

    //the max length for request is 6 month
    if (this.validate_period_len() == false) return false;

    //required field reason
    if (!this.reason) return false;

    //if reason is not standard, a custom one must be specified
    if (
      this.reason == "other" &&
      (!this.custom_reason || this.custom_reason == "")
    )
      return false;
    return true;
  }

  /**
   * Checks absence length (in days), it can't be more then 180 days
   */
  validate_period_len() {
    if (!this.end_date) return true;
    var start = new Date(this.start_date);
    var end = new Date(this.end_date);
    var timeDiff = Math.abs(end.getTime() - start.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (diffDays > 180) return false;
    return true;
  }
}
