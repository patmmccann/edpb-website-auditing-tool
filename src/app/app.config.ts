import { ApplicationConfig } from "@angular/core";
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { CookieKnowledgesService } from "./services/knowledges/cookie-knowledges.service";
import { KnowledgeBaseService } from "./services/knowledge-base.service";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { WATTranslateLoader } from "./shared/translate/wattranslate-loader";

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes, withHashLocation()),
        KnowledgeBaseService,
        CookieKnowledgesService,
    provideHttpClient(withInterceptorsFromDi()),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useClass: WATTranslateLoader,
            deps: [HttpClient],
        },
    }).providers!,
    provideAnimationsAsync()]
}
