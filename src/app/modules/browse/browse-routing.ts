/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { BrowseComponent } from './browse.component';


export const browseRoutes: Route[] = [
  {
    path: '',
    component: BrowseComponent
  },
  {
    path: ':id/tag/:tag_id',
    component: BrowseComponent
  }
];
