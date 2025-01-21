/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Route} from '@angular/router';
import { SettingsComponent } from './settings/settings.component';

export const settingsRoutes: Route[] = [
  { path: '', component: SettingsComponent }
];