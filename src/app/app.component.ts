/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component } from '@angular/core';
import { LanguagesService } from './services/languages.service';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WATTranslateLoader } from './shared/translate/wattranslate-loader';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [SideNavComponent
  ],
  providers: [LanguagesService]
})
export class AppComponent {

  constructor(
    private languagesService: LanguagesService) {
    // Languages initialization
    this.languagesService.initLanguages();
    this.languagesService.getOrSetCurrentLanguage();
  }
}
