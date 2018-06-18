import { Component, Inject, OnDestroy } from '@angular/core';
import { RequestsService } from '../../requests.service'
import { Subscription } from 'rxjs';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';
import { RequestType } from '../../../interfaces';
import * as config from '../../../config.json';
import  swal from 'sweetalert';

@Component({
  selector: 'my-absences-list',
  templateUrl: './my-absences-list.component.html',
  styleUrls: ['./my-absences-list.component.css']
})
export class MyAbsencesListComponent implements OnDestroy {
  private api: string;
  private myrequestsSubscription: Subscription;
  private myrequests : RequestType[];
  private filter: number = -1;
  constructor(public dialog: MatDialog, private RequestsService: RequestsService) {
    this.api = (<any>config).api;
    this.myrequestsSubscription = this.RequestsService.myrequests$.subscribe((requests) => { //subscription to requests-service's observable to get myrequests list
        this.myrequests = requests; //inject recieved data in the table
    });
    this.RequestsService.reset_myrequests_version();
  }

  displayed_requests(){
    if(!this.myrequests) return 0;
    if(!this.filter || this.filter == -1) return this.myrequests.length;
    var count = 0;
    for(var i = 0; i< this.myrequests.length; i++){
      if(this.myrequests[i].state == this.filter){
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
    this.myrequestsSubscription.unsubscribe();
  }


  openDialog(request): void {
     let dialogRef = this.dialog.open(ModifyRequestComponent, {
       data: { request: request }
     });

     dialogRef.afterClosed().subscribe(result => {
       //console.log('The dialog was closed');
     });
   }

}

@Component({
  selector: 'modify-request',
  templateUrl: 'modify-request/modify-request.component.html',
  styleUrls: ['modify-request/modify-request.component.css']
})
export class ModifyRequestComponent {
  private start_date: Date;
  private end_date: Date;
  private reason: string;
  private custom_reason: string;
  private fileList: FileList;

  constructor(public dialogRef: MatDialogRef<ModifyRequestComponent>,@Inject(MAT_DIALOG_DATA) public data: {request: RequestType}, private RequestsService: RequestsService) {
    this.start_date = new Date(this.data.request.start_date);
    this.end_date = new Date(this.data.request.end_date);

    if(this.data.request.reason == 'ferie' || this.data.request.reason == 'malattia' || this.data.request.reason == 'studio'){
      this.reason = this.data.request.reason;
      this.custom_reason = null;
    }else{
      this.reason = "other";
      this.custom_reason = this.data.request.reason;
    }
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

  fileChange(event) {
     this.fileList = event.target.files;
  }

  save_changes(){
    var reason = this.reason=="other" ? this.custom_reason : this.reason;
    swal({
         title: "Conferma",
         text: "Salvare le modifiche apportate alla richiesta?",
         icon: "warning",
         dangerMode: true,
       })
       .then(willDelete => {
         if(willDelete){
          this.RequestsService.modify_request(this.data.request.id, reason, this.start_date, this.end_date, this.fileList, this.dialogRef);
          return;
         }
       });
  }

  validate(){
    if(this.end_date && !(this.end_date >= this.start_date) ) return false;
    if(!this.reason) return false;
    if(this.reason == "other" && (!this.custom_reason || this.custom_reason == "")) return false;
    var old_start_date = new Date(this.data.request.start_date);
    var old_end_date = new Date(this.data.request.end_date);
    if(this.end_date.getTime() != old_end_date.getTime()) return true;
    if(this.start_date.getTime() != old_start_date.getTime()) return true;
    if(this.data.request.reason != "malattia" && this.data.request.reason != "ferie" && this.data.request.reason != "studio" && this.data.request.reason != "other"){
      if( this.reason != "other" || this.custom_reason != this.data.request.reason) return true;
    }
    if(this.reason != this.data.request.reason && (this.data.request.reason == "malattia" || this.data.request.reason == "ferie" || this.data.request.reason == "studio")) return true;
    if (this.fileList && this.fileList.length > 0) return true;

    return false;
  }

}
