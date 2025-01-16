/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BrowserService } from 'src/app/services/browser.service';
import { SettingsService } from 'src/app/services/settings.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AnalysisComponent } from './analysis/analysis.component';
import { BrowserComponent } from './browser/browser.component';
import { GeneralComponent } from './general/general.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatButton, NgIf, MatIcon, AnalysisComponent, BrowserComponent, GeneralComponent, TranslateModule]
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
