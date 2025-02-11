/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit } from '@angular/core';
import { BrowserService } from 'src/app/services/browser.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AnalysisComponent } from './analysis/analysis.component';
import { BrowserComponent } from './browser/browser.component';
import { GeneralComponent } from './general/general.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatButtonModule, MatIconModule, AnalysisComponent, BrowserComponent, GeneralComponent, TranslateModule]
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
