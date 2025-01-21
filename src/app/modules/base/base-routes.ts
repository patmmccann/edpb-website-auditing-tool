/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route} from '@angular/router';
import { BaseComponent } from './base.component';


export const baseRoutes: Route[] = [
  {
    path: ':id',
    component: BaseComponent
  }
];
