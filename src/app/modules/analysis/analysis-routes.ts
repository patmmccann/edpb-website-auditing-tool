/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route } from '@angular/router';
import { AnalysisComponent } from './analysis.component';


export const analysisRoutes: Route[] = [
  {
    path: ':id',
    component: AnalysisComponent
  },
  {
    path: ':id/tag/:tag_id',
    component: AnalysisComponent
  }
];