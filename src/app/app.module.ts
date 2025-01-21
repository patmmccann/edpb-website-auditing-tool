/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
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



@NgModule({
  declarations: [
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
    TemplateModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
