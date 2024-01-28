/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowseComponent } from './browse.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: 'browse',
        component: BrowseComponent
      },
      {
        path: 'browse/:id/tag/:tag_id',
        component: BrowseComponent
      }
    ])
  ]
})
export class BrowseRoutingModule { }
