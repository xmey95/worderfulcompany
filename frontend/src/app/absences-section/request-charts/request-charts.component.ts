import { BrowserModule } from '@angular/platform-browser';
import { Component, Input, NgModule, OnChanges, SimpleChanges } from '@angular/core';
import { RequestsService } from '../requests.service';
import { RequestType, UserType } from '../../interfaces';

@Component({
  selector: 'request-charts',
  templateUrl: './request-charts.component.html',
  styleUrls: ['./request-charts.component.css'
              ]
})
export class RequestChartsComponent implements OnChanges {
  @Input() general: boolean;
  @Input() requests: RequestType[]; //all the Requests
  @Input() employees: UserType[]; //all the Employees of the user
  monthly_data: any[]; //data for vertical chart derived from list containing all requests
  cards_data: any[]; //data for number cards chart derived from requests list
  pie_data: any[]; //data for pie chart derived from requests list
  users_data: any[]; //data for horizontal chart derived from requests list
  colorScheme = {
    domain: ['#a8385d', '#7aa3e5', '#a27ea8', '#aae3f5', '#adcded', '#a95963', '#AAAAAA']
  };
  userscolorScheme = {
    domain: ['#a10a28', '#d3342d', '#ef6d49', '#faad67', '#fdde90', '#dbed91', '#AAAAAA']
  };
  consider_pending: boolean = true;
  year_filter: boolean = false;
  year_selected: number = 2018;
  constructor(){
    this.monthly_data = this.make_monthly_data();
    this.cards_data = this.make_cards_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  absence_days(){
    if(!this.requests)return 0;
    var count = 0;
    for(var i = 0; i < this.requests.length; i++){
        if(this.requests[i].state == 0 || this.requests[i].state == 2 ) continue;
        count = count + this.absence_len(this.requests[i].start_date, this.requests[i].end_date);
    }
    return count;
  }

  absence_len(start_date,end_date){
    var start = new Date(start_date);
    var end = new Date(end_date);
    if(start == end) return 1;
    if(this.year_filter == true){
      if(end.getFullYear() > start.getFullYear()){
        end = new Date(start.getFullYear(), 11,31, 0, 0, 0, 0);
      }
    }
    var timeDiff = Math.abs(end.getTime() - start.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays +1;
  }

  check_year_belonging(request,year){
    var start = new Date(request.start_date).getFullYear();
    var end = new Date(request.end_date).getFullYear();

    if(year <= end && year >=start)return true;
    return false;
  }

  days_from_last_absence(){
    if(!this.requests)return 0;
    var start;
    var end;
    var date = new Date();
    var last;
    for(var i = 0; i < this.requests.length; i++){
      if(this.requests[i].state == 0 || this.requests[i].state == 2)continue;
      start = new Date(this.requests[i].start_date);
      end = new Date(this.requests[i].end_date);

      if(start > date) continue;

      if(end >= date && start < date) return 0;
      if(end > last || !last) last =  end;
    }

    if(!last) return 0;
    var timeDiff = Math.abs(date.getTime() - last.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays-1;
  }

  days_in_month(request,month){
    var start = new Date(request.start_date);
    var end = new Date(request.end_date);

    if(start == end){ //one day absence
      if(this.year_filter==true && start.getFullYear() != this.year_selected)return 0;
      if(start.getMonth == month)return 1;
      else return 0;
    }

    if(start.getFullYear() == end.getFullYear()){ //il permesso inizia e finisce nello stesso anno
      if(this.year_filter==true && start.getFullYear() != this.year_selected)return 0;


      if (start.getMonth()<month && end.getMonth() > month) return this.month_days(month);

      if(start.getMonth() < month && end.getMonth() == month){
        var start_of_month = new Date(end.getFullYear(),month,1, 0,0,0,0);
        var timeDiff = Math.abs(end.getTime() - start_of_month.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays+1;
      }

      if(start.getMonth() == month && end.getMonth() > month){
        var end_of_month = new Date(end.getFullYear(),month,this.month_days(month), 0,0,0,0);
        var timeDiff = Math.abs(end_of_month.getTime() - start.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays+1;
      }

      if(start.getMonth() == month && end.getMonth() == month){
        var timeDiff = Math.abs(end.getTime() - start.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays+1;
      }
      return 0;
    }else{ //il permesso finisce l'anno successivo rispetto a quando inizia
      if(start.getMonth > month && end.getMonth < month)return 0; //mese non presente nel permesso

      if(month > start.getMonth()){ //il mese è successivo all'inizio del permesso ma entro la fine dell'anno
        if(this.year_filter == true && start.getFullYear()!=this.year_selected)return 0;
        return this.month_days(month);
      }
      if(month < end.getMonth()){ //Il mese è nell'anno successivo all'inizio del permesso ma entro la sua fine
        if(this.year_filter == true && end.getFullYear()!=this.year_selected)return 0;
        return this.month_days(month);
      }

      if(start.getMonth() == month){ //il permesso inizia durante il mese e si conclude l'anno successivo
        if(this.year_filter == true && start.getFullYear()!=this.year_selected)return 0;
        var end_of_month = new Date(start.getFullYear(),month,this.month_days(month), 0,0,0,0);
        var timeDiff = Math.abs(end_of_month.getTime() - start.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays+1;
      }
      if(end.getMonth()==month){ //il permesso è cominciato l'anno precedente e si conclude nel corso del mese
        if(this.year_filter == true && end.getFullYear()!=this.year_selected)return 0;
        var start_of_month = new Date(start.getFullYear(),month,1, 0,0,0,0);
        var timeDiff = Math.abs(end.getTime() - start_of_month.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays+1;
      }
      return 0;
    }
  }

  get_absence_days(id){
    var count = 0;
    for(var i = 0; i < this.requests.length; i++){
      if(this.requests[i].id_user == id){
        if(this.year_filter == true && this.check_year_belonging(this.requests[i],this.year_selected) == false) continue;
        if((this.requests[i].state == 0 && this.consider_pending == false) || this.requests[i].state == 2 ) continue;
        count = count + this.absence_len(this.requests[i].start_date, this.requests[i].end_date);
      }
    }
    return count;
  }

  get_monthly_absences_with_reason(month,reason){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++){
      if((this.requests[i].state == 0 && this.consider_pending == false) || this.requests[i].state == 2 ) continue;
      if(this.requests[i].reason != "malattia" && this.requests[i].reason != "studio" && this.requests[i].reason != "ferie"){
        if(reason != "other")continue;
      }else{
        if(reason!=this.requests[i].reason) continue;
      }
      var start_date = new Date(this.requests[i].start_date);
      var end_date = new Date(this.requests[i].end_date);
      count = count + this.days_in_month(this.requests[i],month);
    }
    return count;
  }

  get_pending_number(){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++){
      if(this.requests[i].state == 0){
        count++;
      }
    }
    return count;
  }

  get_refused_number(){
    if(!this.requests)return 0;
    var count = 0;
    for (var i = 0; i < this.requests.length; i++){
      if(this.requests[i].state == 2){
        count++;
      }
    }
    return count;
  }

  get_today_absences(){
    if(!this.requests) return 0;
    var today = new Date();
    var start_date;
    var end_date;
    var count = 0;
    for(var i = 0; i < this.requests.length; i++){
      if(this.requests[i].state == 2)continue;
      start_date = new Date(this.requests[i].start_date);
      end_date = new Date(this.requests[i].end_date);
      if(today < end_date && today > start_date) count++;
    }
    return count;
  }

  is_mobile_device(){
    if(window.screen.width>766)return false;
    return true;
  }

  make_cards_data(){
    var req_number = this.requests ? this.requests.length : 0;
    var employees_number = this.employees ? this.employees.length : 0;
    if(this.general){
      return [
        {
          "name": "Richieste",
          "value": req_number
        },
        {
          "name": "In Attesa",
          "value": this.get_pending_number()
        },
        {
          "name": "Rifiutate",
          "value": this.get_refused_number()
        },
        {
          "name": "Impiegati",
          "value": employees_number
        },
        {
          "name": "Assenti oggi",
          "value": this.get_today_absences()
        }
      ];
    }else{
      return [
        {
          "name": "Richieste",
          "value": req_number
        },
        {
          "name": "In Attesa",
          "value": this.get_pending_number()
        },
        {
          "name": "Rifiutate",
          "value": this.get_refused_number()
        },
        {
          "name": "Giorni di assenza",
          "value": this.absence_days()
        },
        {
          "name": "Giorni dall'ultima Assenza",
          "value": this.days_from_last_absence()
        }
      ];
    }

  }

  make_monthly_data(){
    var data = [
      {
        "name": "Gennaio",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(0, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(0, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(0, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(0, "other")
          },
        ]
      },

      {
        "name": "Febbraio",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(1, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(1, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(1, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(1, "other")
          },
        ]
      },

      {
        "name": "Marzo",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(2, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(2, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(2, "ferie")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(2, "other")
          },
        ]
      },
      {
        "name": "Aprile",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(3, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(3, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(3, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(3, "other")
          },
        ]
      },
      {
        "name": "Maggio",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(4, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(4, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(4, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(4, "other")
          },
        ]
      },
      {
        "name": "Giugno",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(5, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(5, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(5, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(5, "other")
          },
        ]
      },
      {
        "name": "Luglio",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(6, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(6, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(6, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(6, "other")
          },
        ]
      },
      {
        "name": "Agosto",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(7, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(7, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(7, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(7, "other")
          },
        ]
      },
      {
        "name": "Settembre",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(8, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(8, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(8, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(8, "other")
          },
        ]
      },
      {
        "name": "Ottobre",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(9, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(9, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(9, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(9, "other")
          },
        ]
      },
      {
        "name": "Novembre",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(10, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(10, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(10, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(10, "other")
          },
        ]
      },
      {
        "name": "Dicembre",
        "series": [
          {
            "name": "Ferie",
            "value": this.get_monthly_absences_with_reason(11, "ferie")
          },
          {
            "name": "Malattia",
            "value": this.get_monthly_absences_with_reason(11, "malattia")
          },
          {
            "name": "Studio",
            "value": this.get_monthly_absences_with_reason(11, "studio")
          },
          {
            "name": "Altro",
            "value": this.get_monthly_absences_with_reason(11, "other")
          },
        ]
      }
    ];
    return data;
  }

  make_pie_data(){
    var ferie = 0;
    var malattia = 0;
    var studio = 0;
    var altro = 0;
    if(this.requests){
      for(var i = 0; i < this.requests.length; i++){
        if(this.year_filter == true && this.check_year_belonging(this.requests[i],this.year_selected) == false) continue;
        if(this.requests[i].state == 2 || (this.consider_pending == false && this.requests[i].state == 0)) continue;
        if(this.requests[i].reason == "malattia"){
            malattia++;
            continue;
        }
        if(this.requests[i].reason == "ferie"){
            ferie++;
            continue;
        }
        if(this.requests[i].reason == "studio"){
            studio++;
            continue;
        }
        altro++;
      }
    }
    return [
      {
        "name": "Ferie",
        "value": ferie
      },
      {
        "name": "Malattia",
        "value": malattia
      },
      {
        "name": "Studio",
        "value": studio
      },
      {
        "name": "Altro",
        "value": altro
      }
    ];
  }

  make_users_data(){
    var res = [];
    if(!this.employees || !this.requests) return res;
    for(var i = 0; i < this.employees.length; i++){
      res.push({
        "name": this.employees[i].surname + " " + this.employees[i].name,
        "value": this.get_absence_days(this.employees[i].id)
      });
    }

    res = this.sort_list(res);
    return res;
  }

  month_days(month){
    if(month == 3 || month == 5 || month == 8 || month == 10) return 30;
    if(month == 1)return 28;
    return 31;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.monthly_data = this.make_monthly_data();
    this.cards_data = this.make_cards_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  reload_data(){
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  sort_list(list){
    var found = true;
    var temp;
    while(found==true){
      found=false;
      for(var i = 0; i < list.length-1; i++){
        if(list[i].value < list[i+1].value){
          found = true;
          temp = list[i];
          list[i] = list[i+1];
          list[i+1] = temp;
        }
      }
    }
    return list;
  }

  pending_toggle_changed(val){
    this.consider_pending = val.checked;
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }

  year_toggle_changed(val){
    this.year_filter = val.checked;
    this.monthly_data = this.make_monthly_data();
    this.pie_data = this.make_pie_data();
    this.users_data = this.make_users_data();
  }
}
