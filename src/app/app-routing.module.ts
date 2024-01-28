/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntriesRoutingModule } from './modules/entries/entries-routing.module';
import { HomeComponent } from './modules/others/home/home.component';
import { OthersRoutingModule } from './modules/others/others-routing.module';
import { BrowseRoutingModule } from './modules/browse/browse-routing.module';
import { AnalysisRoutingModule } from './modules/analysis/analysis-routing.module';
import { ReportRoutingModule } from './modules/report/report-routing.module';
import { BaseRoutingModule } from './modules/base/base-routing.module';
import { TemplateRoutingModule } from './modules/template/template-routing.module';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }];

@NgModule({
  imports: [
    EntriesRoutingModule,
    BaseRoutingModule,
    TemplateRoutingModule,
    OthersRoutingModule,
    BrowseRoutingModule,
    AnalysisRoutingModule,
    ReportRoutingModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
