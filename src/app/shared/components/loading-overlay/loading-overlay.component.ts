/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-overlay',
    templateUrl: './loading-overlay.component.html',
    styleUrls: ['./loading-overlay.component.scss'],
    imports: [MatProgressSpinner]
})
export class LoadingOverlayComponent implements OnInit {
  @Input() visibility: boolean = false;
  @Input() childMode = false;
  constructor() {}

  ngOnInit() {
    
  }
}
