import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntriesComponent } from './entries.component';
import { EntriesRoutingModule } from './entries-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NewAnalysisComponent } from './new-analysis/new-analysis.component';
import { AnalysisLineComponent } from './analysis-line/analysis-line.component';
import { NewKnowledgebaseComponent } from './forms/new-knowledgebase/new-knowledgebase.component';
import { FiltersComponent } from './filters/filters.component';
import { MaterialAllModule } from 'src/app/material.module';
import { NewBaseComponent } from './new-base/new-base.component';
import { KnowledgebaseTableComponent } from './knowledgebase-table/knowledgebase-table.component';
import { NewTemplateComponent } from './new-template/new-template.component';
import { TemplateTableComponent } from './template-table/template-table.component';

@NgModule({
  declarations: [
    EntriesComponent,
    NewAnalysisComponent,
    AnalysisLineComponent,
    NewKnowledgebaseComponent,
    FiltersComponent,
    NewBaseComponent,
    KnowledgebaseTableComponent,
    NewTemplateComponent,
    TemplateTableComponent
  ],
  imports: [
    CommonModule,
    EntriesRoutingModule,
    SharedModule,
    MaterialAllModule
  ]
})
export class EntriesModule { }
