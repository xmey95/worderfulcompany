import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { RequestsSurveysService } from "../requests.service";
import { Subscription } from "rxjs";
import {} from "@angular/material";
import { SurveyType, MySurveyType } from "../../interfaces";
import * as config from "../../config.json";
import swal from "sweetalert";
import { Router } from "@angular/router";

@Component({
  selector: "allsurveys",
  templateUrl: "./allsurveys.component.html",
  styleUrls: ["./allsurveys.component.css"]
})
export class AllsurveysComponent implements OnInit {
  private allsurveys: SurveyType[]; //list of the surveys
  private allsurveysSubscription: Subscription;
  private mysurveys: MySurveyType[]; //list of my surveys
  private mysurveysSubscription: Subscription;

  /**
   * This component shows frontend section for surveys list, and contains  a list of all surveys and a percentage spinner of submitted surveys
   */

  constructor(
    private RequestsSurveysService: RequestsSurveysService,
    private router: Router
  ) {
    this.allsurveysSubscription = this.RequestsSurveysService.all_surveys$.subscribe(
      surveys => {
        this.allsurveys = surveys; //save received data
      }
    );

    this.mysurveysSubscription = this.RequestsSurveysService.my_surveys$.subscribe(
      surveys => {
        this.mysurveys = surveys; //save received data
      }
    );

    this.RequestsSurveysService.reset_all_surveys_version();
    this.RequestsSurveysService.reset_my_surveys_version();
  }

  /**
   * Return true if specific survey was submitted by user
   */

  isSubmitted(survey_id: number) {
    var submitted = this.mysurveys.filter(
      survey => survey.id_survey == survey_id
    );
    if (submitted.length > 0) return true;
    return false;
  }

  /**
   * Return percentage of surveys submitted by user
   */

  percentageSurveysSubmitted() {
    var percentage = 100 / this.allsurveys.length;
    return percentage * this.mysurveys.length;
  }

  /**
   * Open Survey clicked
   */

  openSurvey(survey) {
    if (!this.isSubmitted(survey))
      this.router.navigate(["/surveys/compile/" + survey + "/false"]);
    if (this.isSubmitted(survey))
      this.router.navigate(["/surveys/compile/" + survey + "/true"]);
  }

  ngOnInit() {}
}
