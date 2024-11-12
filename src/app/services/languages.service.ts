/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {WATTranslateLoader} from '../shared/translate/wattranslate-loader';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  selectedLanguage: string = "en";

  constructor(
    @Inject(TranslateService)  private translateService: TranslateService
    ) { }

  /**
   * Initialize languages on the PIA tool
   */
  initLanguages(): void {
    this.translateService.addLangs(this.availableLanguages);
    this.translateService.setDefaultLang(this.selectedLanguage);
  }

  /**
  * Get the current language or set it
  */
  getOrSetCurrentLanguage(): void {
    let language = localStorage.getItem('userLanguage');
    // If a language has already been chosen
    if (language && language.length > 0) {
      this.translateService.use(language);
      this.selectedLanguage = language;
    } else {
      // Set default language
      const browserLang = this.translateService.getBrowserLang();
      if (!browserLang) return;

      language = browserLang.match(
        /en|fr/
      )
        ? browserLang
        : 'en';
      if (language) {
        this.translateService.use(language);
        this.selectedLanguage = language;
      }
    }
  }

  /**
 * Update the current language after choosing a new one
 * @param {string} selectedLanguage
 */
  updateCurrentLanguage(selectedLanguage: string): void {
    localStorage.setItem('userLanguage', selectedLanguage);
    this.translateService.use(selectedLanguage);
    this.selectedLanguage = selectedLanguage;
  }

  browserCultureLang() : string | undefined {
    return this.translateService.getBrowserCultureLang();
  }

  get availableLanguages(){
    return Object.keys(WATTranslateLoader.availableLanguages);
  }
}
