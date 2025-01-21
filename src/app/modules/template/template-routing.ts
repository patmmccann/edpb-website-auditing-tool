/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route} from '@angular/router';
import { TemplateComponent } from './template.component';

export const templateRoutes: Route[] = [
  {
    path: ':id',
    component: TemplateComponent
  }
];
