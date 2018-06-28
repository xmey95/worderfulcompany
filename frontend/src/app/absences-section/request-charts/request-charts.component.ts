import { BrowserModule } from "@angular/platform-browser";
import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { RequestsService } from "../requests.service";
import { RequestType, UserType } from "../../interfaces";

/**
 * This Component shows a series of charts getting data from 2 input array (requests and employees). It is used in admin section for absence requests
 *
 * NOTE: Chart components got from ngx-charts: https://swimlane.gitbook.io/ngx-charts/v/docs-test/
 */
@Component({
  selector: "request-charts",
  templateUrl: "./request-charts.component.html",
  styleUrls: ["./request-charts.component.css"]
})
export class RequestChartsComponent implements OnChanges {
  @Input() general: boolean; //It is true when component is in the general overview of employees and not in the single-employee page
  @Input() requests: RequestType[]; //All the requests
  @Input() employees: UserType[]; //all the Employees of the user
  monthly_data: any[]; //data for vertical chart, derived from list containing all requests
  cards_data: any[]; //data for number cards chart, derived from requests list
  pie_data: any[]; //data for pie chart derived, from requests list
  users_data: any[]; //data for horizontal chart, derived from requests and employees list

  colorScheme = {
    //color scheme for charts
    domain: [
      "#a8385d",
      "#7aa3e5",
      "#a27ea8",
      "#aae3f5",
      "#adcded",
      "#a95963",
      "#AAAAAA"
    ]
  };
  userscolorScheme = {
    //color scheme for user absence chart
    domain: [
      "#a10a28",
      "#d3342d",
      "#ef6d49",
      "#faad67",
      "#fdde90",
      "#dbed91",
      "#AAAAAA"
    ]
  };
  consider_pending: boolean = true; //filter on pending requests for evaluating charts data
  year_filter: boolean = false; //filter on year for evaluating charts data
  year_selected: number = 2018;

  /**
   * The constructor processes input requests and employees lists to get data for the charts
   */
  constructor() {
    this.monthly_data = this.make_monthly_data();
    this.cards_data = this.make_cards_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  /**
   * Get the total number of absences (used for card charts in single employee page)
   */
  absence_days() {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].state == 0 || this.requests[i].state == 2) continue; //status filter
      count =
        count +
        this.absence_len(
          this.requests[i].start_date,
          this.requests[i].end_date
        );
    }
    return count;
  }

  /**
   * Calculates the length (in days) of the absence request
   */
  absence_len(start_date, end_date) {
    var start = new Date(start_date);
    var end = new Date(end_date);
    if (start == end) return 1; //one day absence
    var timeDiff = Math.abs(end.getTime() - start.getTime()); //number of milliseconds between the two dates
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); //convert milliseconds in days
    return diffDays + 1; //return the number of days, we need to add one day because in the db end date is saved as the last day of absence
  }

  /**
   * Method used for the year filternig, if request has no day in the selected year return false
   */
  check_year_belonging(request, year) {
    var start = new Date(request.start_date).getFullYear();
    var end = new Date(request.end_date).getFullYear();
    if (year <= end && year >= start) return true;
    return false;
  }

  /**
   * Get the number of days from last absence in requests list (just approved) this method is used only in the single-employee page
   */
  days_from_last_absence() {
    if (!this.requests) return 0;
    var start;
    var end;
    var date = new Date();
    var last;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].state == 0 || this.requests[i].state == 2) continue; //just approved requests
      start = new Date(this.requests[i].start_date);
      end = new Date(this.requests[i].end_date);

      if (start > date) continue; //future requests
      if (end >= date && start < date) return 0; //absence today
      if (end > last || !last) last = end; //found nearest absence in the past, save it
    }

    if (!last) return 0; //no absence found
    var timeDiff = Math.abs(date.getTime() - last.getTime()); //milliseconds from absence
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); //days from the absence
    return diffDays - 1; //we have to subtract one because end date of the absences is saved in the db as the 0:00 of the last day of absence
  }

  /**
   * Get the number of thays of a request that are in a specified month (used for monthly report chart)
   */
  days_in_month(request, month) {
    var start = new Date(request.start_date);
    var end = new Date(request.end_date);

    if (start == end) {
      //one day absence
      if (this.year_filter == true && start.getFullYear() != this.year_selected)
        return 0; //year filter
      if (start.getMonth == month) return 1;
      else return 0;
    }

    if (start.getFullYear() == end.getFullYear()) {
      //the absence starts and ends in the same year
      if (this.year_filter == true && start.getFullYear() != this.year_selected)
        return 0; //year filter

      if (start.getMonth() < month && end.getMonth() > month)
        return this.month_days(month); //the whole month is in the request period

      if (start.getMonth() < month && end.getMonth() == month) {
        //the absence starts before and ends in the specified month
        var start_of_month = new Date(end.getFullYear(), month, 1, 0, 0, 0, 0);
        var timeDiff = Math.abs(end.getTime() - start_of_month.getTime()); //calculate the number of days between the start of the month and the end of the absence
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }

      if (start.getMonth() == month && end.getMonth() > month) {
        //the absence starts during the month and ends after it
        var end_of_month = new Date(
          end.getFullYear(),
          month,
          this.month_days(month),
          0,
          0,
          0,
          0
        );
        var timeDiff = Math.abs(end_of_month.getTime() - start.getTime()); //calculate the number of days between the start of the requests and the end of the month
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }

      if (start.getMonth() == month && end.getMonth() == month) {
        //The absence in entirely contained in the month
        var timeDiff = Math.abs(end.getTime() - start.getTime()); //calculate the number of days between the start and the end of the request
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }
      return 0; //no day of absence is in the month
    } else {
      //The request starts in a certain year and ends inthe year after it
      if (start.getMonth > month && end.getMonth < month) return 0; //no day of absence in the month

      if (month > start.getMonth()) {
        //The month is after the start of the request but before the end of the year
        if (
          this.year_filter == true &&
          start.getFullYear() != this.year_selected
        )
          return 0; //year filter
        return this.month_days(month);
      }
      if (month < end.getMonth()) {
        //The month is in the year after the start but the end of the request is after it
        if (this.year_filter == true && end.getFullYear() != this.year_selected)
          return 0; //year filter
        return this.month_days(month);
      }

      if (start.getMonth() == month) {
        //The absence starts during the month and ends in the year later
        if (
          this.year_filter == true &&
          start.getFullYear() != this.year_selected
        )
          return 0; //year filter
        var end_of_month = new Date(
          start.getFullYear(),
          month,
          this.month_days(month),
          0,
          0,
          0,
          0
        );
        var timeDiff = Math.abs(end_of_month.getTime() - start.getTime()); //calculate the number of days between the start of the request and the end of the month
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }
      if (end.getMonth() == month) {
        //The requests starts in the past year and ends during the month
        if (this.year_filter == true && end.getFullYear() != this.year_selected)
          return 0;
        var start_of_month = new Date(
          start.getFullYear(),
          month,
          1,
          0,
          0,
          0,
          0
        );
        var timeDiff = Math.abs(end.getTime() - start_of_month.getTime()); //calculate the number of days between the start of the month and the end of the absence
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }
      return 0;
    }
  }

  /**
   * Get the number of thays of a request that are in the selected year (used for user-absences chart if year filter is activated)
   */
  days_in_selected_year(start_date, end_date) {
    var start = new Date(start_date);
    var end = new Date(end_date);

    if (start == end) {
      //one day absence
      if (start.getFullYear() != this.year_selected) return 0;
      else return 1;
    }

    if (start.getFullYear() == end.getFullYear()) {
      //the absence starts and ends in the same year
      if (start.getFullYear() != this.year_selected) return 0;
      else return this.absence_len(start_date, end_date);
    } else {
      //the request starts in a certain year and ends in the later one
      if (this.year_selected == start.getFullYear()) {
        //start year is selected
        var end_of_year = new Date(start.getFullYear(), 11, 31, 0, 0, 0, 0);
        var timeDiff = Math.abs(end_of_year.getTime() - start.getTime()); //calculate the number of days between the start of the request and the end of the year
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }
      if (this.year_selected == end.getFullYear()) {
        //end year is selected
        var start_of_year = new Date(end.getFullYear(), 0, 31, 0, 0, 0, 0);
        var timeDiff = Math.abs(end_of_year.getTime() - start.getTime()); //calculate the number of days between the start of the year and the end of the absence
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays + 1;
      }
      return 0;
    }
  }

  /**
   * Get the number of absences of a specified employee (used in the general overview)
   */
  get_absence_days(id) {
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].id_user == id) {
        if (
          (this.requests[i].state == 0 && this.consider_pending == false) ||
          this.requests[i].state == 2
        )
          continue; //state filter
        if (this.year_filter == false) {
          count =
            count +
            this.absence_len(
              this.requests[i].start_date,
              this.requests[i].end_date
            );
        } else {
          count =
            count +
            this.days_in_selected_year(
              this.requests[i].start_date,
              this.requests[i].end_date
            );
        }
      }
    }
    return count;
  }

  /**
   * Get the number of days of the request that have specified reason and are in the specified month (used for monthly report)
   */
  get_monthly_absences_with_reason(month, reason) {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (
        (this.requests[i].state == 0 && this.consider_pending == false) ||
        this.requests[i].state == 2
      )
        continue; //state filter
      if (
        this.requests[i].reason != "malattia" &&
        this.requests[i].reason != "studio" &&
        this.requests[i].reason != "ferie"
      ) {
        //check reason
        if (reason != "other") continue;
      } else {
        if (reason != this.requests[i].reason) continue;
      }

      var start_date = new Date(this.requests[i].start_date);
      var end_date = new Date(this.requests[i].end_date);
      count = count + this.days_in_month(this.requests[i], month); //Calculate the day of absence in the month
    }
    return count;
  }

  /**
   * Get the number of pending request from requests list (used in card chart)
   */
  get_pending_number() {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].state == 0) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get the number of refused request from requests list (used in card chart)
   */
  get_refused_number() {
    if (!this.requests) return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].state == 2) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get the number of absences in the current day, used in card chart (only in general overview)
   */
  get_today_absences() {
    if (!this.requests) return 0;
    var today = new Date();
    var start_date;
    var end_date;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++) {
      if (this.requests[i].state == 2) continue; //consider just pending and approved requests
      start_date = new Date(this.requests[i].start_date);
      end_date = new Date(this.requests[i].end_date);
      if (today < end_date && today > start_date) count++;
    }
    return count;
  }

  /**
   * Check device screen dimEnsion to hide some contents
   */
  is_mobile_device() {
    if (window.screen.width > 766) return false;
    return true;
  }

  /**
   * Creates data object to be injected in cards chart
   */
  make_cards_data() {
    var req_number = this.requests ? this.requests.length : 0;
    var employees_number = this.employees ? this.employees.length : 0;
    if (this.general) {
      //general overview
      return [
        {
          name: "Richieste",
          value: req_number
        },
        {
          name: "In Attesa",
          value: this.get_pending_number()
        },
        {
          name: "Rifiutate",
          value: this.get_refused_number()
        },
        {
          name: "Impiegati",
          value: employees_number
        },
        {
          name: "Assenti oggi",
          value: this.get_today_absences()
        }
      ];
    } else {
      //single employee
      return [
        {
          name: "Richieste",
          value: req_number
        },
        {
          name: "In Attesa",
          value: this.get_pending_number()
        },
        {
          name: "Rifiutate",
          value: this.get_refused_number()
        },
        {
          name: "Giorni di assenza",
          value: this.absence_days()
        },
        {
          name: "Giorni dall'ultima Assenza",
          value: this.days_from_last_absence()
        }
      ];
    }
  }

  /**
   * Creates data object to be injected in monthly report chart
   */
  make_monthly_data() {
    var data = [
      {
        name: "Gennaio",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(0, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(0, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(0, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(0, "other")
          }
        ]
      },

      {
        name: "Febbraio",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(1, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(1, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(1, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(1, "other")
          }
        ]
      },

      {
        name: "Marzo",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(2, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(2, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(2, "ferie")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(2, "other")
          }
        ]
      },
      {
        name: "Aprile",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(3, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(3, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(3, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(3, "other")
          }
        ]
      },
      {
        name: "Maggio",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(4, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(4, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(4, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(4, "other")
          }
        ]
      },
      {
        name: "Giugno",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(5, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(5, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(5, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(5, "other")
          }
        ]
      },
      {
        name: "Luglio",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(6, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(6, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(6, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(6, "other")
          }
        ]
      },
      {
        name: "Agosto",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(7, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(7, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(7, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(7, "other")
          }
        ]
      },
      {
        name: "Settembre",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(8, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(8, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(8, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(8, "other")
          }
        ]
      },
      {
        name: "Ottobre",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(9, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(9, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(9, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(9, "other")
          }
        ]
      },
      {
        name: "Novembre",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(10, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(10, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(10, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(10, "other")
          }
        ]
      },
      {
        name: "Dicembre",
        series: [
          {
            name: "Ferie",
            value: this.get_monthly_absences_with_reason(11, "ferie")
          },
          {
            name: "Malattia",
            value: this.get_monthly_absences_with_reason(11, "malattia")
          },
          {
            name: "Studio",
            value: this.get_monthly_absences_with_reason(11, "studio")
          },
          {
            name: "Altro",
            value: this.get_monthly_absences_with_reason(11, "other")
          }
        ]
      }
    ];
    return data;
  }

  /**
   * Creates data object to be injected in pie chart
   */
  make_pie_data() {
    var ferie = 0;
    var malattia = 0;
    var studio = 0;
    var altro = 0;
    if (this.requests) {
      for (var i = 0; i < this.requests.length; i++) {
        if (
          this.year_filter == true &&
          this.check_year_belonging(this.requests[i], this.year_selected) ==
            false
        )
          continue; //year filter
        if (
          this.requests[i].state == 2 ||
          (this.consider_pending == false && this.requests[i].state == 0)
        )
          continue; //state filter
        if (this.requests[i].reason == "malattia") {
          malattia++;
          continue;
        }
        if (this.requests[i].reason == "ferie") {
          ferie++;
          continue;
        }
        if (this.requests[i].reason == "studio") {
          studio++;
          continue;
        }
        altro++;
      }
    }
    return [
      {
        name: "Ferie",
        value: ferie
      },
      {
        name: "Malattia",
        value: malattia
      },
      {
        name: "Studio",
        value: studio
      },
      {
        name: "Altro",
        value: altro
      }
    ];
  }

  /**
   * Creates data object to be injected in absence-days chart (used in general overview only)
   */
  make_users_data() {
    var res = [];
    if (!this.employees || !this.requests) return res;
    for (var i = 0; i < this.employees.length; i++) {
      res.push({
        name: this.employees[i].surname + " " + this.employees[i].name,
        value: this.get_absence_days(this.employees[i].id)
      });
    }

    res = this.sort_list(res); //results are sorted
    return res;
  }

  /**
   * Get the number of days in the month
   */
  month_days(month) {
    if (month == 3 || month == 5 || month == 8 || month == 10) return 30;
    if (month == 1) return 28;
    return 31;
  }

  /**
   * Method called when some input changes, refreshes all charts data
   */
  ngOnChanges(changes: SimpleChanges) {
    this.monthly_data = this.make_monthly_data();
    this.cards_data = this.make_cards_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  /**
   * This method reloads charts data, it is called after year filter selection
   */
  reload_data() {
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  /**
   * Simple sorting of user absences data, by the number of absence-days
   */
  sort_list(list) {
    var found = true;
    var temp;
    while (found == true) {
      found = false;
      for (var i = 0; i < list.length - 1; i++) {
        if (list[i].value < list[i + 1].value) {
          found = true;
          temp = list[i];
          list[i] = list[i + 1];
          list[i + 1] = temp;
        }
      }
    }
    return list;
  }

  /**
   * Enable/Disable pending state filter, then reload charts data
   */
  pending_toggle_changed(val) {
    this.consider_pending = val.checked;
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  /**
   * Enable/Disable year filter, then reload charts data
   */
  year_toggle_changed(val) {
    this.year_filter = val.checked;
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }
}
