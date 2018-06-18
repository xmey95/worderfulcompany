import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as config from '../../config.json';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestsService } from '../requests.service';
import  swal from 'sweetalert';

@Component({
  selector: 'app-my-absences',
  templateUrl: './my-absences.component.html',
  styleUrls: ['./my-absences.component.css']
})
export class MyAbsencesComponent implements OnInit {
  private api : string;
  private start_date: Date = new Date();
  private end_date: Date;
  private reason: string;
  private custom_reason: string;
  private fileList: FileList;
  constructor(private HttpClient : HttpClient, private RequestsService : RequestsService) {
    this.api = (<any>config).api;
    this.start_date.setHours(0,0,0,0);
  }

  fileChange(event) {
     this.fileList = event.target.files;
  }

  ngOnInit() {
  }

  send_request(){
    var reason = this.reason == "other" ? this.custom_reason : this.reason;
    var end_date = this.end_date ? this.end_date : this.start_date;
    this.RequestsService.send_request(reason,this.start_date, end_date, this.fileList);
    this.start_date = new Date();
    this.end_date = null;
    this.reason = null;
    this.custom_reason = null;
    this.fileList = null;
  }

  validate(){
    if(this.end_date && !(this.end_date >= this.start_date) ) return false;
    if(!this.reason) return false;
    if(this.reason == "other" && (!this.custom_reason || this.custom_reason == "")) return false;
    return true;
  }

}
