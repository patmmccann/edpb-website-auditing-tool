/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
    selector: 'app-browser',
    templateUrl: './browser.component.html',
    styleUrls: ['./browser.component.scss'],
    standalone: false
})
export class BrowserComponent {
  localStorage:any=null;

  constructor(
    public settingService : SettingsService
  ) { 
    this.localStorage =localStorage;
  }
}
