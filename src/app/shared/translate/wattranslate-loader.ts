/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import en from '../../../assets/i18n/en.json';
import fr from '../../../assets/i18n/fr.json';

import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class WATTranslateLoader implements TranslateLoader {
  
  static availableLanguages :any =  {
    'en' :en,
    'fr' :fr
  }

  public getTranslation(lang: string): Observable<any> {
    return Observable.create((observer: any) => {
      if (lang in WATTranslateLoader.availableLanguages){
        observer.next(WATTranslateLoader.availableLanguages[lang]);
      }else {
        observer.next(WATTranslateLoader.availableLanguages['en']);
      }
      observer.complete();
    });
  }
}
