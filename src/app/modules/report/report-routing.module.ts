/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportComponent } from './report.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'report/:id',
        component: ReportComponent
      },
      {
        path: 'report/:id/tag/:tag_id',
        component: ReportComponent
      },
      {
        path: 'report/:id/tag/:tag_id/card/:card_id',
        component: ReportComponent
      }
    ])
  ],

  exports: [RouterModule]
})
export class ReportRoutingModule { }
