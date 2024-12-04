/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { LanguagesService } from './services/languages.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  
  constructor(
    private languagesService: LanguagesService) {
      // Languages initialization
      this.languagesService.initLanguages();
      this.languagesService.getOrSetCurrentLanguage();
    }
}
