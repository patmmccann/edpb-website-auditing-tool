/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route} from '@angular/router';
import { HomeComponent } from './home/home.component';

export const helpsRoutes: Route[] = [
  { path: ':section_id', component: HomeComponent }
];