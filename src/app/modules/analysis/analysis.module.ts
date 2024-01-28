/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsComponent } from './tags/tags.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AnalysisComponent } from './analysis.component';
import { ContentComponent } from './content/content.component';
import { AnalysisRoutingModule } from './analysis-routing.module';
import { SourcesComponent } from './sources/sources.component';
import { GlobalCardComponent } from './content/cards/global-card/global-card.component';
import { MaterialAllModule } from 'src/app/material.module';

@NgModule({
  declarations: [
    TagsComponent,
    AnalysisComponent,
    ContentComponent,
    SourcesComponent,
    GlobalCardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AnalysisRoutingModule,
    MaterialAllModule
  ],
  exports:[
  ]
})
export class AnalysisModule { }
