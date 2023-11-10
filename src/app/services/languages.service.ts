import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  selectedLanguage: string = "en";

  constructor(private translateService: TranslateService) { }

  /**
   * Initialize languages on the PIA tool
   */
  initLanguages(): void {
    this.translateService.addLangs([
      'en',
      'fr'
    ]);

    this.translateService.setDefaultLang('en');
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
}
