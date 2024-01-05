/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EntriesComponent } from './entries.component';
import { NewAnalysisComponent } from './analysis/new-analysis/new-analysis.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'entries',
        component: EntriesComponent
      },
      {
        path: 'entries/new',
        component: NewAnalysisComponent
      },
      {
        path: 'entries/new/:id',
        component: NewAnalysisComponent
      },
      {
        path: 'entries/report',
        component: EntriesComponent
      },
      {
        path: 'entries/knowledge_bases',
        component: EntriesComponent
      },
      {
        path: 'entries/template',
        component: EntriesComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class EntriesRoutingModule { }
