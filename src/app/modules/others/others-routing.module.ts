/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild([
    { path: 'settings', component: SettingsComponent },
    { path: 'helps/:section_id', component: HomeComponent }
  ])],
  exports: [RouterModule]
})
export class OthersRoutingModule { }
