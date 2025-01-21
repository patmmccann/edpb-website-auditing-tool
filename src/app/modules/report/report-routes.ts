/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route } from '@angular/router';
import { ReportComponent } from './report.component';

export const reportRoutes: Route[] = [
  {
    path: ':id',
    component: ReportComponent
  },
  {
    path: ':id/tag/:tag_id',
    component: ReportComponent
  },
  {
    path: ':id/tag/:tag_id/card/:card_id',
    component: ReportComponent
  }
];