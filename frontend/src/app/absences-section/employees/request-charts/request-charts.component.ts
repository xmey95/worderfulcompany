import { Component } from '@angular/core';
import { RequestsService } from '../../requests.service'

@Component({
  selector: 'request-charts',
  templateUrl: './request-charts.component.html',
  styleUrls: ['./request-charts.component.css'
              ]
})
export class RequestChartsComponent {
  constructor(private RequestsService : RequestsService){

  }

}
