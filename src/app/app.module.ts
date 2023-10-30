import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EntriesModule } from './modules/entries/entries.module';
import { SharedModule } from './shared/shared.module';
import { OthersModule } from './modules/others/others.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { BaseModule } from './modules/base/base.module';
import { BrowseModule } from './modules/browse/browse.module';
import { TemplateModule } from './modules/template/template.module';
import { ReportModule } from './modules/report/report.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { WATTranslateLoader } from './translate/wattranslate-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    EntriesModule,
    BaseModule,
    BrowseModule,
    OthersModule,
    AnalysisModule,
    ReportModule,
    TemplateModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useClass: WATTranslateLoader,
          deps: [HttpClient]
      }
  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
