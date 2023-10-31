import fr from '../../assets/i18n/fr.json';
import en from '../../assets/i18n/en.json';

import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class WATTranslateLoader implements TranslateLoader {
    public getTranslation(lang: string): Observable<any> {
        return Observable.create((observer: any) => {
          switch (lang) {
            case 'en':
              observer.next(en);
              break;
            case 'fr':
              observer.next(fr);
              break;
            default:
              observer.next(en);
          }
          observer.complete();
        });
      }
}
