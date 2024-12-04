/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BrowserService } from 'src/app/services/browser.service';
import { SettingsService } from 'src/app/services/settings.service';
@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnInit {
  option:'general'|'browser'|'analysis'|'cookies'='general';

  constructor(
    public browserService: BrowserService
  ) { 

  }

  ngOnInit(): void {

  }
}
