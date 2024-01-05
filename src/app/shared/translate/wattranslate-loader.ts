/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import en from '../../../assets/i18n/en.json';

import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class WATTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create((observer: any) => {
          switch (lang) {
            case 'en':
              observer.next(en);
              break;
            default:
              observer.next(en);
          }
          observer.complete();
        });
      }
}
