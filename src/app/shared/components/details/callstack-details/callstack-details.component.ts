/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnChanges, OnInit,SimpleChanges } from '@angular/core';
import { CookieLogEvent, LogEvent, LogModels, RequestTrackingLogEvent, StorageLocalStorageLogEvent } from 'src/app/models/cards/log-event.model';


@Component({
  selector: 'app-callstack-details',
  templateUrl: './callstack-details.component.html',
  styleUrls: ['./callstack-details.component.scss']
})


export class CallstackDetailsComponent implements OnInit, OnChanges {
  
  @Input() event : LogModels | null = null;
  
  
  constructor() {
  }
  ngOnInit(): void {
    
  }

  asCookieLogEvent(event : LogEvent){
    return event as CookieLogEvent;
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  asRequestTrackingLogEvent(event : LogEvent){
    return event as RequestTrackingLogEvent;
  }

  asStorageLocalStorageLogEvent(event : LogEvent){
    return event as StorageLocalStorageLogEvent;
  }
}
