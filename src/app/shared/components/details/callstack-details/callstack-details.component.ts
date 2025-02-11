/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnChanges, OnInit,SimpleChanges } from '@angular/core';
import { CookieLog } from 'src/app/models/cards/cookie-log.model';
import { Log } from 'src/app/models/cards/log.model';
import { RequestTrackingLog } from 'src/app/models/cards/request-tracking-log.model';
import { CookieLogDetailsComponent } from './cookie-log-details/cookie-log-details.component';
import { RequestTrackingDetailsComponent } from './request-tracking-details/request-tracking-details.component';
import { StorageLocalStorageDetailsComponent } from './storage-local-storage-details/storage-local-storage-details.component';


@Component({
    selector: 'app-callstack-details',
    templateUrl: './callstack-details.component.html',
    styleUrls: ['./callstack-details.component.scss'],
    imports: [CookieLogDetailsComponent, RequestTrackingDetailsComponent, StorageLocalStorageDetailsComponent]
})


export class CallstackDetailsComponent implements OnInit {
  
  @Input() log : Log | null = null;
  
  
  constructor() {
  }
  ngOnInit(): void {
    
  }

  asRequestTrackingLog(log:Log){
    return log as RequestTrackingLog;
  }

  asCookieLog(log:Log){
    return log as CookieLog;
  }
}
