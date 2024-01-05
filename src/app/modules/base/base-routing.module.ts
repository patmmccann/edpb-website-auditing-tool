/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BaseComponent } from './base.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'knowledge_bases/:id',
        component: BaseComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class BaseRoutingModule { }
