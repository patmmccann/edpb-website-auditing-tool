/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-browser',
    templateUrl: './browser.component.html',
    styleUrls: ['./browser.component.scss'],
    imports: [MatSlideToggle, FormsModule, MatFormField, MatLabel, MatInput, TranslateModule]
})
export class BrowserComponent {
  localStorage:any=null;

  constructor(
    public settingService : SettingsService
  ) { 
    this.localStorage =localStorage;
  }
}
